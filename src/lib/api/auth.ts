import type { AuthUser } from "@/lib/types";
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

export const authService = {
	async login(identifier: string, password: string) {
		const res = await apiFetch<AuthResponse>("/api/auth/local", {
			method: "POST",
			body: JSON.stringify({ identifier, password }),
		});
		// users-permissions login response omits the role; fetch the
		// authoritative profile (role slug) with the fresh token
		const me = await apiFetch<{ data: Omit<AuthUser, "jwt"> }>(
			"/api/users/me",
			{
				headers: { Authorization: `Bearer ${res.jwt}` } as Record<
					string,
					string
				>,
			},
		);
		return { ...me.data, jwt: res.jwt };
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
		const me = await apiFetch<{ data: Omit<AuthUser, "jwt"> }>(
			"/api/users/me",
			{
				headers: { Authorization: `Bearer ${res.jwt}` } as Record<
					string,
					string
				>,
			},
		);
		return { ...me.data, jwt: res.jwt };
	},

	/** Current user with role (contract shape). */
	me() {
		return apiFetch<{ data: Omit<AuthUser, "jwt"> }>("/api/users/me");
	},
};
