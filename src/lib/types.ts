export type Role = "admin" | "content_manager" | "instructor" | "student";

export const ROLE_LABELS: Record<Role, string> = {
	admin: "Admin",
	content_manager: "Content Manager",
	instructor: "Instructor",
	student: "Student",
};

export interface User {
	id: number;
	username: string;
	email: string;
	role: Role;
	fullName?: string;
}

export interface AuthUser extends User {
	jwt: string;
}

export interface Course {
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

export type LessonContent =
	| { kind: "text"; body: string }
	| { kind: "video"; videoUrl: string };

export interface Lesson {
	id: number;
	documentId: string;
	courseId: number;
	title: string;
	order: number;
	content: LessonContent;
}

export interface QuizOption {
	text: string;
	isCorrect?: boolean;
}

export interface QuizQuestion {
	id: number;
	text: string;
	options: QuizOption[];
}

export interface Quiz {
	id: number;
	documentId: string;
	courseId: number;
	title: string;
	questions: QuizQuestion[];
}

export interface QuizResult {
	id: number;
	quizId: number;
	quizTitle: string;
	courseId: number;
	courseTitle: string;
	score: number;
	total: number;
	submittedAt: string;
	answers: number[];
}

export interface Enrollment {
	id: number;
	userId: number;
	courseId: number;
	enrolledAt: string;
}

export interface CourseProgress {
	courseId: number;
	totalLessons: number;
	completedLessons: number;
	percent: number;
}

export interface StudentProgress {
	user: User;
	completedLessons: number;
	totalLessons: number;
	percent: number;
	lastActivity?: string;
}

export interface Post {
	id: number;
	documentId: string;
	title: string;
	body: string;
	coverImageUrl?: string;
	authorId: number;
	authorName: string;
	publishedAt: string | null;
	createdAt: string;
}

export interface PlatformStats {
	usersByRole: Record<Role, number>;
	totalUsers: number;
	totalCourses: number;
	totalEnrollments: number;
	totalLessons: number;
	totalQuizzes: number;
	publishedPosts: number;
	draftPosts: number;
}
