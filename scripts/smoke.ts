/**
 * Smoke test: exercises the mock API handler directly with the same
 * call pattern apiFetch uses (token in Authorization header).
 * Run: bunx tsx scripts/smoke.ts  (or bun run scripts/smoke.ts)
 */
import { mockRequest } from "../src/lib/api/mock/handler";

function authHeader(jwt: string): Record<string, string> {
	return { Authorization: `Bearer ${jwt}` };
}

async function main() {
	// minimal browser shims for localStorage + crypto.randomUUID
	const store = new Map<string, string>();
	(globalThis as unknown as { window: object }).window = {};
	Object.defineProperty(globalThis, "localStorage", {
		value: {
			getItem: (k: string) => store.get(k) ?? null,
			setItem: (k: string, v: string) => store.set(k, v),
			removeItem: (k: string) => store.delete(k),
		},
	});
	Object.defineProperty(globalThis, "crypto", {
		value: {
			...(globalThis as { crypto: Crypto }).crypto,
			randomUUID: () =>
				"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
					const r = (Math.random() * 16) | 0;
					return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
				}),
		},
	});

	let pass = 0;
	let fail = 0;
	function check(name: string, cond: boolean, extra = "") {
		if (cond) {
			pass++;
			console.log(`  ✓ ${name}`);
		} else {
			fail++;
			console.error(`  ✗ ${name} ${extra}`);
		}
	}

	// 1. login as each role
	const admin = (await mockRequest("/api/auth/local", {
		method: "POST",
		body: JSON.stringify({
			identifier: "admin@librelms.dev",
			password: "admin123",
		}),
	})) as { jwt: string };
	const student = (await mockRequest("/api/auth/local", {
		method: "POST",
		body: JSON.stringify({
			identifier: "student@librelms.dev",
			password: "student123",
		}),
	})) as { jwt: string };
	check("admin login", Boolean(admin.jwt));
	check("student login", Boolean(student.jwt));

	// 2. authenticated request via Authorization header (the fixed path)
	const myCourses = (await mockRequest("/api/my/courses", {
		headers: authHeader(student.jwt),
	})) as {
		data: { course: { id: number }; progress: { percent: number } }[];
	};
	check("student my/courses with token", myCourses.data.length === 2);

	// 3. no token => 401
	let unauthorized = false;
	try {
		await mockRequest("/api/my/courses");
	} catch (e) {
		unauthorized = (e as { status: number }).status === 401;
	}
	check("my/courses without token rejected 401", unauthorized);

	// 4. student cannot create course
	let forbidden = false;
	try {
		await mockRequest("/api/courses", {
			method: "POST",
			headers: authHeader(student.jwt),
			body: JSON.stringify({ title: "Hack", description: "" }),
		});
	} catch (e) {
		forbidden = (e as { status: number }).status === 403;
	}
	check("student course create rejected 403", forbidden);

	// 5. lessons visible to enrolled student
	const lessons = (await mockRequest("/api/lessons?courseId=1", {
		headers: authHeader(student.jwt),
	})) as { data: unknown[] };
	check("enrolled student sees lessons", lessons.data.length === 4);

	// 6. quiz view sanitized (no isCorrect)
	const quizView = (await mockRequest("/api/quizzes/1/view", {
		headers: authHeader(student.jwt),
	})) as {
		data: { questions: { options: { isCorrect?: boolean }[] }[] };
	};
	const leaked = quizView.data.questions.some((q) =>
		q.options.some((o) => o.isCorrect !== undefined),
	);
	check("quiz view has no correct answers", !leaked);

	// 7. quiz submit grades correctly (all correct => 3/3) and returns correctAnswers
	const submit = (await mockRequest("/api/quizzes/1/submit", {
		method: "POST",
		headers: authHeader(student.jwt),
		body: JSON.stringify({ answers: [0, 0, 0] }),
	})) as { data: { score: number; total: number; correctAnswers: number[] } };
	check(
		"quiz submit perfect score",
		submit.data.score === 3 && submit.data.total === 3,
	);
	check(
		"submit returns correctAnswers",
		submit.data.correctAnswers.length === 3 &&
			submit.data.correctAnswers.every((c) => c === 0),
	);

	// 8. results history reflects new result
	const results = (await mockRequest("/api/my/quiz-results", {
		headers: authHeader(student.jwt),
	})) as { data: { score: number }[] };
	check(
		"results history stored",
		results.data.some((r) => r.score === 3),
	);

	// 9. lesson completion: mark + idempotent
	const done = (await mockRequest("/api/lesson-completions", {
		method: "POST",
		headers: authHeader(student.jwt),
		body: JSON.stringify({ lessonId: 3 }),
	})) as { data: { id: number } };
	check("mark complete returns row", Boolean(done.data.id));
	const progress = (await mockRequest("/api/courses/1/progress", {
		headers: authHeader(student.jwt),
	})) as { data: { percent: number; completedLessons: number } };
	check("progress updated to 3/4 = 75%", progress.data.percent === 75);

	// 10. admin stats + role change
	const stats = (await mockRequest("/api/stats", {
		headers: authHeader(admin.jwt),
	})) as { data: { totalUsers: number } };
	check("admin stats", stats.data.totalUsers === 5);
	let statsDenied = false;
	try {
		await mockRequest("/api/stats", { headers: authHeader(student.jwt) });
	} catch (e) {
		statsDenied = (e as { status: number }).status === 403;
	}
	check("stats denied to student", statsDenied);

	const users = (await mockRequest("/api/users", {
		headers: authHeader(admin.jwt),
	})) as { data: { id: number; role: string }[] };
	const student5 = users.data.find((u) => u.id === 5);
	check("user list includes student2", student5?.role === "student");

	// 11. drafts hidden from public blog list
	const publicPosts = (await mockRequest("/api/posts")) as {
		data: { publishedAt: string | null }[];
	};
	check(
		"public posts all published",
		publicPosts.data.every((p) => p.publishedAt !== null),
	);

	// 12. duplicate enrollment rejected
	let dup = false;
	try {
		await mockRequest("/api/enrollments", {
			method: "POST",
			headers: authHeader(student.jwt),
			body: JSON.stringify({ courseId: 1 }),
		});
	} catch (e) {
		dup = (e as { status: number }).status === 400;
	}
	check("duplicate enrollment rejected", dup);

	// 13. instructor sees lessons of own course but is 403 on others
	const instructor = (await mockRequest("/api/auth/local", {
		method: "POST",
		body: JSON.stringify({
			identifier: "instructor@librelms.dev",
			password: "instructor123",
		}),
	})) as { jwt: string };
	const ownLessons = (await mockRequest("/api/lessons?courseId=1", {
		headers: authHeader(instructor.jwt),
	})) as { data: unknown[] };
	check("instructor sees own course lessons", ownLessons.data.length === 4);

	let instructorDenied = false;
	let denialMessage = "";
	try {
		await mockRequest("/api/lessons?courseId=3", {
			headers: authHeader(instructor.jwt),
		});
	} catch (e) {
		instructorDenied = (e as { status: number }).status === 403;
		denialMessage = (e as Error).message;
	}
	check(
		"instructor denied lessons on non-owned course",
		instructorDenied &&
			denialMessage.includes(
				"You don't have permission to view this course",
			),
	);

	console.log(`\n${pass} passed, ${fail} failed`);
	if (fail > 0) process.exitCode = 1;
}

void main();
