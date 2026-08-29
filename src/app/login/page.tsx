"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
	const { login } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await login(identifier, password);
			const next = searchParams.get("next");
			router.replace(next?.startsWith("/") ? next : "/");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Login failed, try again",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container-page flex min-h-[70vh] items-center justify-center">
			<div className="border border-border rounded-xl bg-card w-full max-w-md p-6">
				<h1 className="text-page-title mb-1">Log in</h1>
				<p className="mb-6 text-sm text-muted-foreground">
					Welcome back to LibreLMS.
				</p>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Label htmlFor="identifier">Email or username</Label>
						<Input
							id="identifier"
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							placeholder="you@example.com"
							required
						/>
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter password"
							required
						/>
					</div>
					{error && (
						<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
						</p>
					)}
					<Button type="submit" className="w-full" loading={loading}>
						Log in
					</Button>
				</form>
				<p className="mt-4 text-center text-sm text-muted-foreground">
					No account yet?{" "}
					<Link
						href="/register"
						className="font-medium text-brand-600 hover:underline"
					>
						Sign up
					</Link>
				</p>
				<div className="mt-6 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
					<div className="mb-1 font-semibold text-foreground">
						Demo accounts
					</div>
					<div>admin@librelms.dev / admin123</div>
					<div>manager@librelms.dev / manager123</div>
					<div>instructor@librelms.dev / instructor123</div>
					<div>student@librelms.dev / student123</div>
				</div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}
