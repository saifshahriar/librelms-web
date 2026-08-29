import type { Course, CourseProgress } from "@/lib/types";
import { apiFetch } from "./client";

export const enrollmentService = {
	enroll(courseId: number) {
		return apiFetch<{ data: unknown }>("/api/enrollments", {
			method: "POST",
			body: JSON.stringify({ courseId }),
		});
	},

	myCourses() {
		return apiFetch<{
			data: { course: Course; progress: CourseProgress }[];
		}>("/api/my/courses");
	},
};
