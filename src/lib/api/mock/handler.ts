import { ApiError } from "@/lib/api/client";
import type { Role } from "@/lib/types";
import {
	type DbUser,
	fullQuiz,
	getDb,
	nextId,
	persist,
	progressFor,
	sanitizeQuiz,
	studentProgressFor,
	toCourse,
	toLesson,
	toPost,
	toQuizResult,
	toUser,
} from "./db";

function findUserByToken(init?: RequestInit): DbUser | null {
	const headers = init?.headers;
	if (!headers) return null;
	let raw: string | undefined;
	if (typeof headers === "string") {
		raw = headers;
	} else if (Array.isArray(headers)) {
		raw = headers.find(([k]) => k.toLowerCase() === "authorization")?.[1];
	} else {
		for (const [k, v] of Object.entries(headers)) {
			if (k.toLowerCase() === "authorization") raw = v as string;
		}
	}
	if (!raw) return null;
	const token = raw.replace(/^Bearer\s+/, "").trim();
	if (!token.startsWith("mock-jwt-")) return null;
	const id = Number.parseInt(token.replace("mock-jwt-", ""), 10);
	return getDb().users.find((u) => u.id === id) ?? null;
}

function requireUser(init?: RequestInit): DbUser {
	const user = findUserByToken(init);
	if (!user) throw new ApiError(401, "Unauthorized");
	return user;
}

function requireRole(user: DbUser, ...roles: Role[]): void {
	if (!roles.includes(user.role)) {
		throw new ApiError(403, "Forbidden");
	}
}

const STAFF: Role[] = ["admin", "content_manager"];

function isCourseOwner(user: DbUser, courseId: number): boolean {
	if (user.role === "admin" || user.role === "content_manager") return true;
	if (user.role !== "instructor") return false;
	return getDb().courses.some(
		(c) => c.id === courseId && c.instructorIds.includes(user.id),
	);
}

function isEnrolled(userId: number, courseId: number): boolean {
	return getDb().enrollments.some(
		(e) => e.userId === userId && e.courseId === courseId,
	);
}

function body<T>(init?: RequestInit): T {
	if (!init?.body) throw new ApiError(400, "Missing body");
	return JSON.parse(init.body as string) as T;
}

function mkDocId(prefix: string): string {
	return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function mockRequest<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const d = getDb();
	const url = new URL(path, "http://mock.local");
	const p = url.pathname;
	const method = (init?.method ?? "GET").toUpperCase();
	const q = url.searchParams;

	/* ---------- auth ---------- */
	if (p === "/api/auth/local" && method === "POST") {
		const { identifier, password } = body<{
			identifier: string;
			password: string;
		}>(init);
		const user = d.users.find(
			(u) => u.email === identifier || u.username === identifier,
		);
		if (!user || user.password !== password) {
			throw new ApiError(400, "Invalid identifier or password");
		}
		return {
			jwt: `mock-jwt-${user.id}`,
			user: toUser(user),
		} as T;
	}

	if (p === "/api/auth/local/register" && method === "POST") {
		const { username, email, password, fullName } = body<{
			username: string;
			email: string;
			password: string;
			fullName?: string;
		}>(init);
		if (d.users.some((u) => u.email === email || u.username === username)) {
			throw new ApiError(400, "Username or email already taken");
		}
		const user: DbUser = {
			id: nextId("users"),
			username,
			email,
			fullName,
			role: "student",
			password,
		};
		d.users.push(user);
		persist();
		return {
			jwt: `mock-jwt-${user.id}`,
			user: toUser(user),
		} as T;
	}

	if (p === "/api/users/me" && method === "GET") {
		return toUser(requireUser(init)) as T;
	}

	/* ---------- courses ---------- */
	if (p === "/api/courses" && method === "GET") {
		const list = d.courses.map(toCourse);
		return {
			data: list,
			meta: { pagination: { total: list.length } },
		} as T;
	}

	if (p === "/api/courses" && method === "POST") {
		const user = requireUser(init);
		requireRole(user, "admin", "content_manager", "instructor");
		const b = body<{
			title: string;
			description: string;
			coverImageUrl?: string;
		}>(init);
		if (!b.title?.trim()) throw new ApiError(400, "Title is required");
		const course = {
			id: nextId("courses"),
			documentId: mkDocId("course"),
			title: b.title.trim(),
			description: b.description ?? "",
			coverImageUrl: b.coverImageUrl || "",
			instructorIds: user.role === "instructor" ? [user.id] : [],
			lessonIds: [],
			quizIds: [],
			createdAt: new Date().toISOString(),
		};
		d.courses.push(course);
		persist();
		return { data: toCourse(course) } as T;
	}

	const courseMatch = p.match(/^\/api\/courses\/(\d+)$/);
	if (courseMatch) {
		const courseId = Number.parseInt(courseMatch[1], 10);
		const course = d.courses.find((c) => c.id === courseId);
		if (!course) throw new ApiError(404, "Course not found");

		if (method === "GET") {
			return { data: toCourse(course) } as T;
		}
		if (method === "PUT") {
			const user = requireUser(init);
			if (!isCourseOwner(user, courseId))
				throw new ApiError(403, "Forbidden");
			const b = body<{
				title?: string;
				description?: string;
				coverImageUrl?: string;
			}>(init);
			if (b.title !== undefined) course.title = b.title.trim();
			if (b.description !== undefined) course.description = b.description;
			if (b.coverImageUrl !== undefined)
				course.coverImageUrl = b.coverImageUrl || "";
			persist();
			return { data: toCourse(course) } as T;
		}
		if (method === "DELETE") {
			const user = requireUser(init);
			if (!isCourseOwner(user, courseId))
				throw new ApiError(403, "Forbidden");
			d.courses = d.courses.filter((c) => c.id !== courseId);
			d.lessons = d.lessons.filter((l) => l.courseId !== courseId);
			d.quizzes = d.quizzes.filter((q) => q.courseId !== courseId);
			d.enrollments = d.enrollments.filter(
				(e) => e.courseId !== courseId,
			);
			d.completions = d.completions.filter((c) => {
				const lesson = d.lessons.find((l) => l.id === c.lessonId);
				return lesson ? lesson.courseId !== courseId : true;
			});
			persist();
			return { data: null } as T;
		}
	}

	const progressMatch = p.match(/^\/api\/courses\/(\d+)\/progress$/);
	if (progressMatch && method === "GET") {
		const courseId = Number.parseInt(progressMatch[1], 10);
		const user = requireUser(init);
		const course = d.courses.find((c) => c.id === courseId);
		if (!course) throw new ApiError(404, "Course not found");

		if (user.role === "student") {
			if (!isEnrolled(user.id, courseId))
				throw new ApiError(403, "Not enrolled");
			return { data: progressFor(d, user.id, courseId) } as T;
		}
		// staff: list of student progress for the course
		if (!isCourseOwner(user, courseId))
			throw new ApiError(403, "Forbidden");
		return { data: studentProgressFor(d, courseId) } as T;
	}

	/* ---------- lessons ---------- */
	if (p === "/api/lessons" && method === "GET") {
		const courseId = Number.parseInt(q.get("courseId") ?? "", 10);
		const user = requireUser(init);
		let lessons = d.lessons;
		if (!Number.isNaN(courseId)) {
			lessons = lessons.filter((l) => l.courseId === courseId);
		}
		// students must be enrolled to see lesson content
		if (user.role === "student" && !Number.isNaN(courseId)) {
			if (!isEnrolled(user.id, courseId))
				throw new ApiError(403, "Not enrolled");
		}
		return { data: lessons.map(toLesson) } as T;
	}

	if (p === "/api/lessons" && method === "POST") {
		const user = requireUser(init);
		const b = body<{
			courseId: number;
			title: string;
			kind: "text" | "video";
			body?: string;
			videoUrl?: string;
		}>(init);
		if (!isCourseOwner(user, b.courseId))
			throw new ApiError(403, "Forbidden");
		if (!b.title?.trim()) throw new ApiError(400, "Title is required");
		const course = d.courses.find((c) => c.id === b.courseId);
		if (!course) throw new ApiError(404, "Course not found");
		const order = course.lessonIds.length + 1;
		const lesson = {
			id: nextId("lessons"),
			documentId: mkDocId("lesson"),
			courseId: b.courseId,
			title: b.title.trim(),
			order,
			kind: b.kind,
			body: b.kind === "text" ? (b.body ?? "") : undefined,
			videoUrl: b.kind === "video" ? b.videoUrl : undefined,
		};
		d.lessons.push(lesson);
		course.lessonIds.push(lesson.id);
		persist();
		return { data: toLesson(lesson) } as T;
	}

	const lessonMatch = p.match(/^\/api\/lessons\/(\d+)$/);
	if (lessonMatch) {
		const lessonId = Number.parseInt(lessonMatch[1], 10);
		const lesson = d.lessons.find((l) => l.id === lessonId);
		if (!lesson) throw new ApiError(404, "Lesson not found");

		if (method === "GET") {
			const user = requireUser(init);
			if (
				user.role === "student" &&
				!isEnrolled(user.id, lesson.courseId)
			)
				throw new ApiError(403, "Not enrolled");
			return { data: toLesson(lesson) } as T;
		}
		if (method === "PUT") {
			const user = requireUser(init);
			if (!isCourseOwner(user, lesson.courseId))
				throw new ApiError(403, "Forbidden");
			const b = body<{
				title?: string;
				kind?: "text" | "video";
				body?: string;
				videoUrl?: string;
			}>(init);
			if (b.title !== undefined) lesson.title = b.title.trim();
			if (b.kind !== undefined) lesson.kind = b.kind;
			if (b.body !== undefined) lesson.body = b.body;
			if (b.videoUrl !== undefined) lesson.videoUrl = b.videoUrl;
			persist();
			return { data: toLesson(lesson) } as T;
		}
		if (method === "DELETE") {
			const user = requireUser(init);
			if (!isCourseOwner(user, lesson.courseId))
				throw new ApiError(403, "Forbidden");
			d.lessons = d.lessons.filter((l) => l.id !== lessonId);
			for (const course of d.courses) {
				course.lessonIds = course.lessonIds.filter(
					(id) => id !== lessonId,
				);
			}
			d.completions = d.completions.filter(
				(c) => c.lessonId !== lessonId,
			);
			persist();
			return { data: null } as T;
		}
	}

	/* ---------- quizzes ---------- */
	if (p === "/api/quizzes" && method === "GET") {
		const courseId = Number.parseInt(q.get("courseId") ?? "", 10);
		const user = requireUser(init);
		let quizzes = d.quizzes;
		if (!Number.isNaN(courseId))
			quizzes = quizzes.filter((qz) => qz.courseId === courseId);
		// students get sanitized quizzes (no correct answers)
		if (user.role === "student" && !Number.isNaN(courseId)) {
			if (!isEnrolled(user.id, courseId))
				throw new ApiError(403, "Not enrolled");
			return { data: quizzes.map(sanitizeQuiz) } as T;
		}
		return { data: quizzes.map(fullQuiz) } as T;
	}

	if (p === "/api/quizzes" && method === "POST") {
		const user = requireUser(init);
		const b = body<{
			courseId: number;
			title: string;
			questions: {
				text: string;
				options: { text: string; isCorrect: boolean }[];
			}[];
		}>(init);
		if (!isCourseOwner(user, b.courseId))
			throw new ApiError(403, "Forbidden");
		if (!b.title?.trim()) throw new ApiError(400, "Title is required");
		if (!b.questions?.length)
			throw new ApiError(400, "Questions are required");
		const course = d.courses.find((c) => c.id === b.courseId);
		if (!course) throw new ApiError(404, "Course not found");
		const quiz = {
			id: nextId("quizzes"),
			documentId: mkDocId("quiz"),
			courseId: b.courseId,
			title: b.title.trim(),
			questions: b.questions.map((question, i) => ({
				id: i + 1,
				text: question.text,
				options: question.options,
			})),
		};
		d.quizzes.push(quiz);
		course.quizIds.push(quiz.id);
		persist();
		return { data: fullQuiz(quiz) } as T;
	}

	const quizMatch = p.match(/^\/api\/quizzes\/(\d+)$/);
	if (quizMatch) {
		const quizId = Number.parseInt(quizMatch[1], 10);
		const quiz = d.quizzes.find((qz) => qz.id === quizId);
		if (!quiz) throw new ApiError(404, "Quiz not found");

		if (method === "GET") {
			const user = requireUser(init);
			if (user.role === "student") {
				if (!isEnrolled(user.id, quiz.courseId))
					throw new ApiError(403, "Not enrolled");
				return { data: sanitizeQuiz(quiz) } as T;
			}
			if (!isCourseOwner(user, quiz.courseId))
				throw new ApiError(403, "Forbidden");
			return { data: fullQuiz(quiz) } as T;
		}
		if (method === "PUT") {
			const user = requireUser(init);
			if (!isCourseOwner(user, quiz.courseId))
				throw new ApiError(403, "Forbidden");
			const b = body<{
				title?: string;
				questions?: {
					text: string;
					options: { text: string; isCorrect: boolean }[];
				}[];
			}>(init);
			if (b.title !== undefined) quiz.title = b.title.trim();
			if (b.questions !== undefined)
				quiz.questions = b.questions.map((question, i) => ({
					id: i + 1,
					text: question.text,
					options: question.options,
				}));
			persist();
			return { data: fullQuiz(quiz) } as T;
		}
		if (method === "DELETE") {
			const user = requireUser(init);
			if (!isCourseOwner(user, quiz.courseId))
				throw new ApiError(403, "Forbidden");
			d.quizzes = d.quizzes.filter((qz) => qz.id !== quizId);
			for (const course of d.courses) {
				course.quizIds = course.quizIds.filter((id) => id !== quizId);
			}
			d.quizResults = d.quizResults.filter((r) => r.quizId !== quizId);
			persist();
			return { data: null } as T;
		}
	}

	const quizViewMatch = p.match(/^\/api\/quizzes\/(\d+)\/view$/);
	if (quizViewMatch && method === "GET") {
		const quizId = Number.parseInt(quizViewMatch[1], 10);
		const user = requireUser(init);
		const quiz = d.quizzes.find((qz) => qz.id === quizId);
		if (!quiz) throw new ApiError(404, "Quiz not found");
		if (user.role === "student") {
			if (!isEnrolled(user.id, quiz.courseId))
				throw new ApiError(403, "Not enrolled");
			return { data: sanitizeQuiz(quiz) } as T;
		}
		if (!isCourseOwner(user, quiz.courseId))
			throw new ApiError(403, "Forbidden");
		return { data: sanitizeQuiz(quiz) } as T;
	}

	const quizSubmitMatch = p.match(/^\/api\/quizzes\/(\d+)\/submit$/);
	if (quizSubmitMatch && method === "POST") {
		const quizId = Number.parseInt(quizSubmitMatch[1], 10);
		const user = requireUser(init);
		requireRole(user, "student");
		const quiz = d.quizzes.find((qz) => qz.id === quizId);
		if (!quiz) throw new ApiError(404, "Quiz not found");
		if (!isEnrolled(user.id, quiz.courseId))
			throw new ApiError(403, "Not enrolled");
		const { answers } = body<{ answers: number[] }>(init);

		// grade server-side: count answers matching a correct option
		let score = 0;
		const correctAnswers: number[] = [];
		for (const [i, question] of quiz.questions.entries()) {
			const correct = question.options.findIndex((o) => o.isCorrect);
			correctAnswers.push(correct);
			if (answers[i] === correct) score++;
		}
		const result = {
			id: nextId("quizResults"),
			userId: user.id,
			quizId,
			score,
			total: quiz.questions.length,
			submittedAt: new Date().toISOString(),
			answers,
			correctAnswers,
		};
		d.quizResults.push(result);
		persist();
		const course = d.courses.find((c) => c.id === quiz.courseId);
		return {
			data: toQuizResult(
				result,
				quiz.title,
				course?.title ?? "",
				quiz.courseId,
			),
		} as T;
	}

	/* ---------- enrollments ---------- */
	if (p === "/api/enrollments" && method === "GET") {
		const user = requireUser(init);
		if (user.role === "student") {
			return {
				data: d.enrollments.filter((e) => e.userId === user.id),
			} as T;
		}
		return { data: d.enrollments } as T;
	}

	if (p === "/api/enrollments" && method === "POST") {
		const user = requireUser(init);
		requireRole(user, "student");
		const { courseId } = body<{ courseId: number }>(init);
		if (!d.courses.some((c) => c.id === courseId))
			throw new ApiError(404, "Course not found");
		if (isEnrolled(user.id, courseId))
			throw new ApiError(400, "Already enrolled");
		const enrollment = {
			id: nextId("enrollments"),
			userId: user.id,
			courseId,
			enrolledAt: new Date().toISOString(),
		};
		d.enrollments.push(enrollment);
		persist();
		return { data: enrollment } as T;
	}

	/* ---------- completions ---------- */
	if (p === "/api/lesson-completions" && method === "GET") {
		const user = requireUser(init);
		if (user.role === "student") {
			return {
				data: d.completions.filter((c) => c.userId === user.id),
			} as T;
		}
		if (user.role === "admin" || user.role === "content_manager") {
			return { data: d.completions } as T;
		}
		// instructors: completions for their own courses
		const ownCourseIds = d.courses
			.filter((c) => c.instructorIds.includes(user.id))
			.map((c) => c.id);
		return {
			data: d.completions.filter((c) => {
				const lesson = d.lessons.find((l) => l.id === c.lessonId);
				return lesson ? ownCourseIds.includes(lesson.courseId) : false;
			}),
		} as T;
	}

	if (p === "/api/lesson-completions" && method === "POST") {
		const user = requireUser(init);
		requireRole(user, "student");
		const { lessonId } = body<{ lessonId: number }>(init);
		const lesson = d.lessons.find((l) => l.id === lessonId);
		if (!lesson) throw new ApiError(404, "Lesson not found");
		if (!isEnrolled(user.id, lesson.courseId))
			throw new ApiError(403, "Not enrolled");
		if (
			d.completions.some(
				(c) => c.userId === user.id && c.lessonId === lessonId,
			)
		) {
			const existing = d.completions.find(
				(c) => c.userId === user.id && c.lessonId === lessonId,
			);
			return { data: existing } as T;
		}
		const completion = {
			id: nextId("completions"),
			userId: user.id,
			lessonId,
			completedAt: new Date().toISOString(),
		};
		d.completions.push(completion);
		persist();
		return { data: completion } as T;
	}

	/* ---------- my courses / results ---------- */
	if (p === "/api/my/courses" && method === "GET") {
		const user = requireUser(init);
		requireRole(user, "student");
		const ids = d.enrollments
			.filter((e) => e.userId === user.id)
			.map((e) => e.courseId);
		const courses = d.courses
			.filter((c) => ids.includes(c.id))
			.map((c) => ({
				course: toCourse(c),
				progress: progressFor(d, user.id, c.id),
			}));
		return { data: courses } as T;
	}

	if (p === "/api/my/quiz-results" && method === "GET") {
		const user = requireUser(init);
		requireRole(user, "student");
		const results = d.quizResults
			.filter((r) => r.userId === user.id)
			.map((r) => {
				const quiz = d.quizzes.find((qz) => qz.id === r.quizId);
				const course = d.courses.find((c) => c.id === quiz?.courseId);
				return toQuizResult(
					r,
					quiz?.title ?? "Deleted quiz",
					course?.title ?? "",
					quiz?.courseId ?? 0,
				);
			})
			.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
		return { data: results } as T;
	}

	/* ---------- posts ---------- */
	if (p === "/api/posts" && method === "GET") {
		const user = findUserByToken(init);
		const wantsDrafts = q.get("publicationState") === "preview";
		let posts = d.posts;
		if (wantsDrafts && user && STAFF.includes(user.role)) {
			// staff preview: all posts
		} else {
			posts = posts.filter((post) => post.publishedAt !== null);
		}
		const mapped = posts
			.map((post) => {
				const author = d.users.find((u) => u.id === post.authorId);
				return toPost(
					post,
					author?.fullName ?? author?.username ?? "Unknown",
				);
			})
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		return { data: mapped } as T;
	}

	if (p === "/api/posts" && method === "POST") {
		const user = requireUser(init);
		requireRole(user, "admin", "content_manager");
		const b = body<{
			title: string;
			body: string;
			coverImageUrl?: string;
			published?: boolean;
		}>(init);
		if (!b.title?.trim()) throw new ApiError(400, "Title is required");
		const post = {
			id: nextId("posts"),
			documentId: mkDocId("post"),
			title: b.title.trim(),
			body: b.body ?? "",
			coverImageUrl: b.coverImageUrl || "",
			authorId: user.id,
			publishedAt: b.published ? new Date().toISOString() : null,
			createdAt: new Date().toISOString(),
		};
		d.posts.push(post);
		persist();
		return { data: toPost(post, user.fullName ?? user.username) } as T;
	}

	const postMatch = p.match(/^\/api\/posts\/([^/]+)$/);
	if (postMatch) {
		const ref = postMatch[1];
		const post =
			d.posts.find((x) => String(x.id) === ref) ??
			d.posts.find((x) => x.documentId === ref);
		if (!post) throw new ApiError(404, "Post not found");

		if (method === "GET") {
			const user = findUserByToken(init);
			const isStaff = user ? STAFF.includes(user.role) : false;
			const isAuthor = user ? user.id === post.authorId : false;
			if (post.publishedAt === null && !(isStaff || isAuthor)) {
				throw new ApiError(404, "Post not found");
			}
			const author = d.users.find((u) => u.id === post.authorId);
			return {
				data: toPost(
					post,
					author?.fullName ?? author?.username ?? "Unknown",
				),
			} as T;
		}
		if (method === "PUT") {
			const user = requireUser(init);
			const allowed =
				user.role === "admin" ||
				(user.role === "content_manager" && user.id === post.authorId);
			if (!allowed) throw new ApiError(403, "Forbidden");
			const b = body<{
				title?: string;
				body?: string;
				coverImageUrl?: string;
				published?: boolean;
			}>(init);
			if (b.title !== undefined) post.title = b.title.trim();
			if (b.body !== undefined) post.body = b.body;
			if (b.coverImageUrl !== undefined)
				post.coverImageUrl = b.coverImageUrl || "";
			if (b.published === true && post.publishedAt === null) {
				post.publishedAt = new Date().toISOString();
			}
			if (b.published === false) post.publishedAt = null;
			persist();
			return {
				data: toPost(post, user.fullName ?? user.username),
			} as T;
		}
		if (method === "DELETE") {
			const user = requireUser(init);
			const allowed =
				user.role === "admin" ||
				(user.role === "content_manager" && user.id === post.authorId);
			if (!allowed) throw new ApiError(403, "Forbidden");
			d.posts = d.posts.filter((x) => x.id !== post.id);
			persist();
			return { data: null } as T;
		}
	}

	/* ---------- users (admin) ---------- */
	if (p === "/api/users" && method === "GET") {
		const user = requireUser(init);
		requireRole(user, "admin");
		return { data: d.users.map(toUser) } as T;
	}

	const userRoleMatch = p.match(/^\/api\/users\/(\d+)\/role$/);
	if (userRoleMatch && method === "PUT") {
		const admin = requireUser(init);
		requireRole(admin, "admin");
		const userId = Number.parseInt(userRoleMatch[1], 10);
		const target = d.users.find((u) => u.id === userId);
		if (!target) throw new ApiError(404, "User not found");
		const { role } = body<{ role: Role }>(init);
		if (
			!["admin", "content_manager", "instructor", "student"].includes(
				role,
			)
		)
			throw new ApiError(400, "Invalid role");
		target.role = role;
		persist();
		return { data: toUser(target) } as T;
	}

	/* ---------- stats (admin) ---------- */
	if (p === "/api/stats" && method === "GET") {
		const user = requireUser(init);
		requireRole(user, "admin");
		const usersByRole: Record<Role, number> = {
			admin: 0,
			content_manager: 0,
			instructor: 0,
			student: 0,
		};
		for (const u of d.users) usersByRole[u.role]++;
		return {
			data: {
				usersByRole,
				totalUsers: d.users.length,
				totalCourses: d.courses.length,
				totalEnrollments: d.enrollments.length,
				totalLessons: d.lessons.length,
				totalQuizzes: d.quizzes.length,
				publishedPosts: d.posts.filter((x) => x.publishedAt !== null)
					.length,
				draftPosts: d.posts.filter((x) => x.publishedAt === null)
					.length,
			},
		} as T;
	}

	throw new ApiError(404, `No mock handler for ${method} ${p}`);
}
