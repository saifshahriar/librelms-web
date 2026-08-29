import type { AuthUser, User } from "@/lib/types";
import { apiFetch } from "./client";

interface AuthResponse {
	jwt: string;
	user: Omit<AuthUser, "jwt">;
}

export const authService = {
	login(identifier: string, password: string) {
		return apiFetch<AuthResponse>("/api/auth/local", {
			method: "POST",
			body: JSON.stringify({ identifier, password }),
		});
	},

	register(input: {
		username: string;
		email: string;
		password: string;
		fullName?: string;
	}) {
		return apiFetch<AuthResponse>("/api/auth/local/register", {
			method: "POST",
			body: JSON.stringify(input),
		});
	},

	me() {
		return apiFetch<User>("/api/users/me");
	},
};
