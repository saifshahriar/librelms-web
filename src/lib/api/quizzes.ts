import type { Quiz, QuizResult } from "@/lib/types";
import { apiFetch } from "./client";

interface ListResponse<T> {
	data: T[];
}

export interface QuizInput {
	courseId: number;
	title: string;
	questions: {
		text: string;
		options: { text: string; isCorrect: boolean }[];
	}[];
}

export const quizService = {
	list(courseId: number) {
		return apiFetch<ListResponse<Quiz>>(
			`/api/quizzes?courseId=${courseId}`,
		);
	},

	view(id: number) {
		return apiFetch<{ data: Quiz }>(`/api/quizzes/${id}/view`);
	},

	create(input: QuizInput) {
		return apiFetch<{ data: Quiz }>("/api/quizzes", {
			method: "POST",
			body: JSON.stringify(input),
		});
	},

	update(
		id: number,
		input: { title?: string; questions?: QuizInput["questions"] },
	) {
		return apiFetch<{ data: Quiz }>(`/api/quizzes/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	},

	remove(id: number) {
		return apiFetch<{ data: null }>(`/api/quizzes/${id}`, {
			method: "DELETE",
		});
	},

	submit(id: number, answers: number[]) {
		return apiFetch<{ data: QuizResult }>(`/api/quizzes/${id}/submit`, {
			method: "POST",
			body: JSON.stringify({ answers }),
		});
	},

	myResults() {
		return apiFetch<ListResponse<QuizResult>>("/api/my/quiz-results");
	},
};
