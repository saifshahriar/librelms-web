import type {
	AuthUser,
	Course,
	CourseProgress,
	Enrollment,
	Lesson,
	Post,
	Quiz,
	QuizResult,
	Role,
	StudentProgress,
	User,
} from "@/lib/types";
import { seedDb } from "./seed";

export interface DbUser extends Omit<User, "role"> {
	password: string;
	role: Role;
}

export interface DbCourse {
	id: number;
	documentId: string;
	title: string;
	description: string;
	coverImageUrl?: string;
	instructorIds: number[];
	lessonIds: number[];
	quizIds: number[];
	createdAt: string;
}

export interface DbLesson {
	id: number;
	documentId: string;
	courseId: number;
	title: string;
	order: number;
	kind: "text" | "video";
	body?: string;
	videoUrl?: string;
}

export interface DbQuiz {
	id: number;
	documentId: string;
	courseId: number;
	title: string;
	questions: {
		id: number;
		text: string;
		options: { text: string; isCorrect: boolean }[];
	}[];
}

export interface DbEnrollment {
	id: number;
	userId: number;
	courseId: number;
	enrolledAt: string;
}

export interface DbCompletion {
	id: number;
	userId: number;
	lessonId: number;
	completedAt: string;
}

export interface DbQuizResult {
	id: number;
	userId: number;
	quizId: number;
	score: number;
	total: number;
	submittedAt: string;
	answers: number[];
}

export interface DbPost {
	id: number;
	documentId: string;
	title: string;
	body: string;
	coverImageUrl?: string;
	authorId: number;
	publishedAt: string | null;
	createdAt: string;
}

export interface MockDb {
	users: DbUser[];
	courses: DbCourse[];
	lessons: DbLesson[];
	quizzes: DbQuiz[];
	enrollments: DbEnrollment[];
	completions: DbCompletion[];
	quizResults: DbQuizResult[];
	posts: DbPost[];
}

const STORAGE_KEY = "librelms.mockdb.v1";
const isBrowser = typeof window !== "undefined";

let db: MockDb | null = null;

export function getDb(): MockDb {
	if (db) return db;
	if (isBrowser && window.localStorage.getItem(STORAGE_KEY)) {
		try {
			db = JSON.parse(
				window.localStorage.getItem(STORAGE_KEY) as string,
			) as MockDb;
			return db;
		} catch {
			// corrupted storage falls through to reseed
		}
	}
	db = seedDb();
	persist();
	return db;
}

export function persist() {
	if (isBrowser && db) {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
	}
}

export function resetDb() {
	db = seedDb();
	persist();
}

export function nextId(seq: (typeof SEQ)[number]): number {
	const d = getDb();
	return d[seq].length > 0
		? Math.max(...d[seq].map((x: { id: number }) => x.id)) + 1
		: 1;
}

const SEQ = [
	"users",
	"courses",
	"lessons",
	"quizzes",
	"enrollments",
	"completions",
	"quizResults",
	"posts",
] as const;

/* ---- row → API shape mappers ---- */

export function toUser(u: DbUser): User {
	const { password: _pw, ...rest } = u;
	return rest;
}

export function toAuthUser(u: DbUser, jwt: string): AuthUser {
	return { ...toUser(u), jwt };
}

export function toCourse(c: DbCourse): Course {
	return { ...c };
}

export function toLesson(l: DbLesson): Lesson {
	return {
		id: l.id,
		documentId: l.documentId,
		courseId: l.courseId,
		title: l.title,
		order: l.order,
		content:
			l.kind === "video"
				? { kind: "video", videoUrl: l.videoUrl ?? "" }
				: { kind: "text", body: l.body ?? "" },
	};
}

export function sanitizeQuiz(q: DbQuiz): Quiz {
	return {
		id: q.id,
		documentId: q.documentId,
		courseId: q.courseId,
		title: q.title,
		questions: q.questions.map((question) => ({
			id: question.id,
			text: question.text,
			options: question.options.map((o) => ({ text: o.text })),
		})),
	};
}

export function fullQuiz(q: DbQuiz): Quiz {
	return {
		id: q.id,
		documentId: q.documentId,
		courseId: q.courseId,
		title: q.title,
		questions: q.questions.map((question) => ({
			id: question.id,
			text: question.text,
			options: question.options.map((o) => ({
				text: o.text,
				isCorrect: o.isCorrect,
			})),
		})),
	};
}

export function toQuizResult(
	r: DbQuizResult,
	quizTitle: string,
	courseTitle: string,
	courseId: number,
): QuizResult {
	return {
		id: r.id,
		quizId: r.quizId,
		quizTitle,
		courseId,
		courseTitle,
		score: r.score,
		total: r.total,
		submittedAt: r.submittedAt,
		answers: r.answers,
	};
}

export function toPost(p: DbPost, authorName: string): Post {
	return {
		id: p.id,
		documentId: p.documentId,
		title: p.title,
		body: p.body,
		coverImageUrl: p.coverImageUrl,
		authorId: p.authorId,
		authorName,
		publishedAt: p.publishedAt,
		createdAt: p.createdAt,
	};
}

export function progressFor(
	d: MockDb,
	userId: number,
	courseId: number,
): CourseProgress {
	const course = d.courses.find((c) => c.id === courseId);
	const total = course ? course.lessonIds.length : 0;
	const done = d.completions.filter(
		(c) => c.userId === userId && course?.lessonIds.includes(c.lessonId),
	).length;
	return {
		courseId,
		totalLessons: total,
		completedLessons: done,
		percent: total > 0 ? Math.round((done / total) * 100) : 0,
	};
}

export function studentProgressFor(
	d: MockDb,
	courseId: number,
): StudentProgress[] {
	const course = d.courses.find((c) => c.id === courseId);
	if (!course) return [];
	return d.enrollments
		.filter((e) => e.courseId === courseId)
		.map((e) => {
			const user = d.users.find((u) => u.id === e.userId);
			const done = d.completions.filter(
				(c) =>
					c.userId === e.userId &&
					course.lessonIds.includes(c.lessonId),
			).length;
			const completions = d.completions
				.filter(
					(c) =>
						c.userId === e.userId &&
						course.lessonIds.includes(c.lessonId),
				)
				.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
			return {
				user: user
					? toUser(user)
					: {
							id: e.userId,
							username: "unknown",
							email: "",
							role: "student" as Role,
						},
				completedLessons: done,
				totalLessons: course.lessonIds.length,
				percent:
					course.lessonIds.length > 0
						? Math.round((done / course.lessonIds.length) * 100)
						: 0,
				lastActivity: completions.at(-1)?.completedAt,
			};
		});
}
