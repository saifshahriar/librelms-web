"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";

export function RequireRole({
	roles,
	children,
}: {
	roles: Role[];
	children: ReactNode;
}) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;
		if (!user) {
			router.replace(
				`/login?next=${encodeURIComponent(window.location.pathname)}`,
			);
		} else if (!roles.includes(user.role)) {
			router.replace("/403");
		}
	}, [user, loading, roles, router]);

	if (loading) {
		return (
			<div className="container-page flex min-h-[50vh] items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
			</div>
		);
	}

	if (!user || !roles.includes(user.role)) return null;

	return <>{children}</>;
}
