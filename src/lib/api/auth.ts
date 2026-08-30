import type { AuthUser, User } from "@/lib/types";
import { apiFetch } from "./client";

interface AuthResponse {
	jwt: string;
	user:
		| Omit<AuthUser, "jwt">
		| {
				id: number | string;
				documentId?: string;
				username: string;
				email: string;
				fullName?: string | null;
				role?: string | { type?: string };
		  };
}

/** Normalize a users-permissions payload into the app user shape. */
function toAppUser(res: AuthResponse): AuthUser {
	const u = res.user as Extract<AuthResponse["user"], { username: string }>;
	return {
		id: typeof u.id === "string" ? Number.parseInt(u.id, 10) : (u.id ?? 0),
		username: u.username,
		email: u.email,
		role: ((typeof u.role === "string"
			? u.role
			: (u.role as { type?: string } | undefined)?.type) ??
			"student") as AuthUser["role"],
		fullName: u.fullName ?? undefined,
		jwt: res.jwt,
	};
}

export const authService = {
	async login(identifier: string, password: string) {
		const res = await apiFetch<AuthResponse>("/api/auth/local", {
			method: "POST",
			body: JSON.stringify({ identifier, password }),
		});
		return toAppUser(res);
	},

	async register(input: {
		username: string;
		email: string;
		password: string;
		fullName?: string;
	}) {
		const res = await apiFetch<AuthResponse>("/api/auth/local/register", {
			method: "POST",
			body: JSON.stringify(input),
		});
		return toAppUser(res);
	},

	/** Current user with role (contract shape). */
	me() {
		return apiFetch<{ data: User }>("/api/users/me");
	},
};
