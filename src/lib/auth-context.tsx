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
		setUser(stored);
		setLoading(false);
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
