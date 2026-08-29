import type { AuthUser, User } from "@/lib/types";
import { setAuthToken } from "@/lib/api/client";

const STORAGE_KEY = "librelms.auth.v1";

export function loadStoredAuth(): AuthUser | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

export function storeAuth(user: AuthUser | null) {
	if (typeof window === "undefined") return;
	if (user) {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	} else {
		window.localStorage.removeItem(STORAGE_KEY);
	}
	setAuthToken(user?.jwt ?? null);
}

export function isStaff(user: User | null | undefined): boolean {
	return user?.role === "admin" || user?.role === "content_manager";
}
