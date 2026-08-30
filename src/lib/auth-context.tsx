"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { authService } from "@/lib/api/auth";
import { loadStoredAuth, storeAuth } from "@/lib/auth-storage";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
	user: AuthUser | null;
	loading: boolean;
	login: (identifier: string, password: string) => Promise<AuthUser>;
	register: (input: {
		username: string;
		email: string;
		password: string;
		fullName?: string;
	}) => Promise<AuthUser>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const stored = loadStoredAuth();
		if (!stored) {
			setLoading(false);
			return;
		}
		setUser(stored);

		// Revalidate against the backend: refreshes the profile (role can
		// change since login, e.g. admin promotion) and drops dead sessions
		// (expired JWT, revoked account, stale token from another backend).
		refreshProfile(stored)
			.then((fresh) => {
				if (fresh) {
					storeAuth(fresh);
					setUser(fresh);
				}
			})
			.finally(() => setLoading(false));

		async function refreshProfile(current: AuthUser) {
			try {
				const res = await authService.me();
				return { ...res.data, jwt: current.jwt };
			} catch {
				// token rejected: end the session
				storeAuth(null);
				setUser(null);
				return null;
			}
		}
	}, []);

	const login = useCallback(async (identifier: string, password: string) => {
		const authUser = await authService.login(identifier, password);
		storeAuth(authUser);
		setUser(authUser);
		return authUser;
	}, []);

	const register = useCallback(
		async (input: {
			username: string;
			email: string;
			password: string;
			fullName?: string;
		}) => {
			const authUser = await authService.register(input);
			storeAuth(authUser);
			setUser(authUser);
			return authUser;
		},
		[],
	);

	const logout = useCallback(() => {
		storeAuth(null);
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
