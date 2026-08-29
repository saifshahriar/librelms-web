import type { Role } from "@/lib/types";

const STAFF: Role[] = ["admin", "content_manager"];
const COURSE_WRITERS: Role[] = ["admin", "content_manager", "instructor"];

export function canManageUsers(user: { role: Role } | null): boolean {
	return user?.role === "admin";
}

export function canWriteCourse(user: { role: Role } | null): boolean {
	return user !== null && COURSE_WRITERS.includes(user.role);
}

export function ownsCourse(
	user: { id: number; role: Role } | null,
	course: { instructorIds: number[] },
): boolean {
	if (!user) return false;
	if (user.role === "admin" || user.role === "content_manager") return true;
	if (user.role !== "instructor") return false;
	return course.instructorIds.includes(user.id);
}

export function canWritePosts(user: { role: Role } | null): boolean {
	return user !== null && STAFF.includes(user.role);
}

export function canTakeQuiz(user: { role: Role } | null): boolean {
	return user?.role === "student";
}

export function roleTone(role: Role) {
	switch (role) {
		case "admin":
			return "danger" as const;
		case "content_manager":
			return "purple" as const;
		case "instructor":
			return "warning" as const;
		case "student":
			return "brand" as const;
	}
}
