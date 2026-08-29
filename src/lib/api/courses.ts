import type { Course, CourseProgress, StudentProgress } from "@/lib/types";
import { apiFetch } from "./client";

interface ListResponse<T> {
	data: T[];
}

export const courseService = {
	list() {
		return apiFetch<ListResponse<Course>>("/api/courses");
	},

	get(id: number) {
		return apiFetch<{ data: Course }>(`/api/courses/${id}`);
	},

	create(input: {
		title: string;
		description: string;
		coverImageUrl?: string;
	}) {
		return apiFetch<{ data: Course }>("/api/courses", {
			method: "POST",
			body: JSON.stringify(input),
		});
	},

	update(
		id: number,
		input: { title?: string; description?: string; coverImageUrl?: string },
	) {
		return apiFetch<{ data: Course }>(`/api/courses/${id}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	},

	remove(id: number) {
		return apiFetch<{ data: null }>(`/api/courses/${id}`, {
			method: "DELETE",
		});
	},

	myProgress(courseId: number) {
		return apiFetch<{ data: CourseProgress }>(
			`/api/courses/${courseId}/progress`,
		);
	},

	studentProgress(courseId: number) {
		return apiFetch<{ data: StudentProgress[] }>(
			`/api/courses/${courseId}/progress`,
		);
	},
};
