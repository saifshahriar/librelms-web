"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Card, CardBody, Input } from "@/components/ui";
import { courseService } from "@/lib/api";
import type { Course } from "@/lib/types";

export default function CoursesPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState("");

	useEffect(() => {
		courseService
			.list()
			.then((res) => setCourses(res.data))
			.finally(() => setLoading(false));
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return courses;
		return courses.filter(
			(c) =>
				c.title.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q),
		);
	}, [courses, query]);

	return (
		<div className="container-page py-10">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-page-title">Courses</h1>
					<p className="mt-1 text-muted-foreground">
						Browse the library and enroll to start learning.
					</p>
				</div>
				<Input
					type="search"
					placeholder="Search courses…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="sm:max-w-xs"
				/>
			</div>

			{loading ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="border border-border rounded-xl bg-card h-44 animate-pulse"
						/>
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="border border-border rounded-xl bg-card px-6 py-16 text-center text-muted-foreground">
					No courses match your search.
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((course) => (
						<Link key={course.id} href={`/courses/${course.id}`}>
							<Card className="h-full transition-shadow hover:shadow-md">
								<CardBody>
									<div className="mb-3 flex items-center gap-2">
										<Badge variant="brand">
											{course.lessonIds.length} lessons
										</Badge>
										{course.quizIds.length > 0 && (
											<Badge variant="purple">
												{course.quizIds.length} quiz
											</Badge>
										)}
									</div>
									<h3 className="text-lg font-semibold">
										{course.title}
									</h3>
									<p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
										{course.description}
									</p>
									<p className="mt-4 text-sm font-medium text-brand-600">
										View course →
									</p>
								</CardBody>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
