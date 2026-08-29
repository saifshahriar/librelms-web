import { apiFetch } from "./client";

export interface LessonCompletion {
	id: number;
	userId: number;
	lessonId: number;
	completedAt: string;
}

export const completionService = {
	mine() {
		return apiFetch<{ data: LessonCompletion[] }>(
			"/api/lesson-completions",
		);
	},

	complete(lessonId: number) {
		return apiFetch<{ data: LessonCompletion }>("/api/lesson-completions", {
			method: "POST",
			body: JSON.stringify({ lessonId }),
		});
	},
};
