"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { adminService } from "@/lib/api";
import { type PlatformStats, ROLE_LABELS } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: number | string }) {
	return (
		<Card>
			<CardBody>
				<div className="text-3xl font-bold text-brand-700">{value}</div>
				<div className="mt-1 text-sm text-muted-foreground">
					{label}
				</div>
			</CardBody>
		</Card>
	);
}

function AdminDashboard() {
	const [stats, setStats] = useState<PlatformStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		adminService
			.stats()
			.then((res) => setStats(res.data))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="border border-border rounded-xl bg-card h-64 animate-pulse" />
			</div>
		);
	}
	if (!stats) return null;

	return (
		<div className="container-page py-10">
			<h1 className="text-page-title mb-2">Admin dashboard</h1>
			<p className="mb-8 text-muted-foreground">Platform overview.</p>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="Total users" value={stats.totalUsers} />
				<StatCard label="Courses" value={stats.totalCourses} />
				<StatCard label="Enrollments" value={stats.totalEnrollments} />
				<StatCard label="Lessons" value={stats.totalLessons} />
			</div>

			<div className="mt-6 grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Users per role</CardTitle>
					</CardHeader>
					<CardBody>
						<ul className="space-y-2">
							{Object.entries(stats.usersByRole).map(
								([role, count]) => (
									<li
										key={role}
										className="flex items-center justify-between text-sm"
									>
										<span>
											{
												ROLE_LABELS[
													role as keyof typeof ROLE_LABELS
												]
											}
										</span>
										<span className="font-semibold">
											{count}
										</span>
									</li>
								),
							)}
						</ul>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Content</CardTitle>
					</CardHeader>
					<CardBody>
						<ul className="space-y-2 text-sm">
							<li className="flex justify-between">
								<span className="text-muted-foreground">
									Quizzes
								</span>
								<span className="font-semibold">
									{stats.totalQuizzes}
								</span>
							</li>
							<li className="flex justify-between">
								<span className="text-muted-foreground">
									Published posts
								</span>
								<span className="font-semibold">
									{stats.publishedPosts}
								</span>
							</li>
							<li className="flex justify-between">
								<span className="text-muted-foreground">
									Draft posts
								</span>
								<span className="font-semibold">
									{stats.draftPosts}
								</span>
							</li>
						</ul>
					</CardBody>
				</Card>
			</div>

			<div className="mt-6 flex gap-3">
				<Link
					href="/admin/users"
					className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
				>
					Manage users
				</Link>
				<Link
					href="/manage/courses"
					className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
				>
					Manage courses
				</Link>
				<Link
					href="/manage/blog"
					className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
				>
					Manage blog
				</Link>
			</div>
		</div>
	);
}

export default function AdminPage() {
	return (
		<RequireRole roles={["admin"]}>
			<AdminDashboard />
		</RequireRole>
	);
}
