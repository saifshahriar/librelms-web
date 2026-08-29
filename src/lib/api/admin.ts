import type { PlatformStats, Role, User } from "@/lib/types";
import { apiFetch } from "./client";

interface ListResponse<T> {
	data: T[];
}

export const adminService = {
	stats() {
		return apiFetch<{ data: PlatformStats }>("/api/stats");
	},

	users() {
		return apiFetch<ListResponse<User>>("/api/users");
	},

	setRole(userId: number, role: Role) {
		return apiFetch<{ data: User }>(`/api/users/${userId}/role`, {
			method: "PUT",
			body: JSON.stringify({ role }),
		});
	},
};
