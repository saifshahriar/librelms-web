import type { Lesson } from "@/lib/types";
import { apiFetch } from "./client";

interface ListResponse<T> {
	data: T[];
}

export interface LessonInput {
	courseId: number;
	title: string;
	kind: "text" | "video";
	body?: string;
	videoUrl?: string;
}

export const lessonService = {
	list(courseId: number) {
		return apiFetch<ListResponse<Lesson>>(
			`/api/lessons?courseId=${courseId}`,
		);
	},

	get(id: number) {
		return apiFetch<{ data: Lesson }>(`/api/lessons/${id}`);
	},

	create(input: LessonInput) {
		return apiFetch<{ data: Lesson }>("/api/lessons", {
			method: "POST",
			body: JSON.stringify(input),
		});
	},

	update(
		id: number,
		input: {
			title?: string;
			kind?: "text" | "video";
			body?: string;
			videoUrl?: string;
		},
	) {
		return apiFetch<{ data: Lesson }>(`/api/lessons/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	},

	remove(id: number) {
		return apiFetch<{ data: null }>(`/api/lessons/${id}`, {
			method: "DELETE",
		});
	},
};
