import { apiFetch } from "./client";

export const completionService = {
	complete(lessonId: number) {
		return apiFetch<{ data: unknown }>("/api/lesson-completions", {
			method: "POST",
			body: JSON.stringify({ lessonId }),
		});
	},
};
