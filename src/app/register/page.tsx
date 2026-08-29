"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
	const { register } = useAuth();
	const router = useRouter();
	const [form, setForm] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	function set<K extends keyof typeof form>(key: K, value: string) {
		setForm((f) => ({ ...f, [key]: value }));
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await register(form);
			router.replace("/");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Registration failed, try again",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container-page flex min-h-[70vh] items-center justify-center">
			<div className="card-surface w-full max-w-md p-6">
				<h1 className="text-page-title mb-1">Create account</h1>
				<p className="mb-6 text-sm text-ink-muted">
					New accounts start as Student — enroll in courses, learn and
					take quizzes.
				</p>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Label htmlFor="fullName">Full name</Label>
						<Input
							id="fullName"
							value={form.fullName}
							onChange={(e) => set("fullName", e.target.value)}
							placeholder="Sam Student"
							required
						/>
					</div>
					<div>
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							value={form.username}
							onChange={(e) => set("username", e.target.value)}
							placeholder="samstudent"
							required
						/>
					</div>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={form.email}
							onChange={(e) => set("email", e.target.value)}
							placeholder="you@example.com"
							required
						/>
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							minLength={6}
							value={form.password}
							onChange={(e) => set("password", e.target.value)}
							placeholder="At least 6 characters"
							required
						/>
					</div>
					{error && (
						<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
						</p>
					)}
					<Button type="submit" className="w-full" loading={loading}>
						Sign up
					</Button>
				</form>
				<p className="mt-4 text-center text-sm text-ink-muted">
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-brand-600 hover:underline"
					>
						Log in
					</Link>
				</p>
			</div>
		</div>
	);
}
