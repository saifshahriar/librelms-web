"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, CardBody } from "@/components/ui";
import { courseService, postService } from "@/lib/api";
import type { Course, Post } from "@/lib/types";

export default function HomePage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const [c, p] = await Promise.all([
					courseService.list(),
					postService.list(),
				]);
				setCourses(c.data.slice(0, 3));
				setPosts(p.data.slice(0, 3));
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	return (
		<div>
			<section className="border-b border-edge bg-gradient-to-b from-brand-50 to-canvas">
				<div className="container-page py-16 text-center">
					<h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
						Learn at your own pace, teach with full control
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-ink-muted">
						LibreLMS is an open learning platform: enroll in
						courses, watch lessons, take quizzes and track your
						progress — or create courses as an instructor.
					</p>
					<div className="mt-8 flex justify-center gap-3">
						<Link
							href="/courses"
							className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
						>
							Browse courses
						</Link>
						<Link
							href="/register"
							className="rounded-lg border border-edge bg-surface px-5 py-2.5 text-sm font-medium hover:bg-canvas"
						>
							Create free account
						</Link>
					</div>
				</div>
			</section>

			<section className="container-page py-12">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-section-title">Popular courses</h2>
					<Link
						href="/courses"
						className="text-sm font-medium text-brand-600 hover:underline"
					>
						View all →
					</Link>
				</div>
				{loading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className="card-surface h-40 animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{courses.map((course) => (
							<Link
								key={course.id}
								href={`/courses/${course.id}`}
							>
								<Card className="h-full transition-shadow hover:shadow-md">
									<CardBody>
										<div className="mb-2 flex items-center justify-between">
											<Badge variant="brand">
												{course.lessonIds.length}{" "}
												lessons
											</Badge>
										</div>
										<h3 className="font-semibold">
											{course.title}
										</h3>
										<p className="mt-1 line-clamp-2 text-sm text-ink-muted">
											{course.description}
										</p>
									</CardBody>
								</Card>
							</Link>
						))}
					</div>
				)}
			</section>

			<section className="container-page pb-12">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-section-title">From the blog</h2>
					<Link
						href="/blog"
						className="text-sm font-medium text-brand-600 hover:underline"
					>
						View all →
					</Link>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{posts.map((post) => (
						<Link key={post.id} href={`/blog/${post.documentId}`}>
							<Card className="h-full transition-shadow hover:shadow-md">
								<CardBody>
									<h3 className="font-semibold">
										{post.title}
									</h3>
									<p className="mt-1 line-clamp-3 text-sm text-ink-muted">
										{post.body}
									</p>
									<p className="mt-3 text-xs text-ink-faint">
										{post.authorName} ·{" "}
										{new Date(
											post.publishedAt ?? post.createdAt,
										).toLocaleDateString()}
									</p>
								</CardBody>
							</Card>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
