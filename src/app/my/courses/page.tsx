"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardBody, ProgressBar } from "@/components/ui";
import { enrollmentService } from "@/lib/api";
import type { Course, CourseProgress } from "@/lib/types";

function MyCourses() {
	const [items, setItems] = useState<
		{ course: Course; progress: CourseProgress }[]
	>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		enrollmentService
			.myCourses()
			.then((res) => setItems(res.data))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="container-page py-10">
			<h1 className="text-page-title mb-2">My Courses</h1>
			<p className="mb-8 text-ink-muted">
				Courses you are enrolled in, with your progress.
			</p>

			{loading ? (
				<div className="grid gap-4 sm:grid-cols-2">
					{[0, 1].map((i) => (
						<div
							key={i}
							className="card-surface h-40 animate-pulse"
						/>
					))}
				</div>
			) : items.length === 0 ? (
				<div className="card-surface px-6 py-16 text-center">
					<p className="text-ink-muted">
						You haven&apos;t enrolled in any course yet.
					</p>
					<Link
						href="/courses"
						className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
					>
						Browse courses
					</Link>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{items.map(({ course, progress }) => (
						<Card
							key={course.id}
							className="transition-shadow hover:shadow-md"
						>
							<CardBody>
								<h3 className="text-lg font-semibold">
									{course.title}
								</h3>
								<p className="mt-1 line-clamp-2 text-sm text-ink-muted">
									{course.description}
								</p>
								<div className="mt-4">
									<div className="mb-1.5 flex items-center justify-between text-sm">
										<span className="text-ink-muted">
											{progress.completedLessons} of{" "}
											{progress.totalLessons} lessons done
										</span>
										<span className="font-semibold text-brand-700">
											{progress.percent}%
										</span>
									</div>
									<ProgressBar value={progress.percent} />
								</div>
								<div className="mt-4 flex gap-2">
									<Link
										href={`/courses/${course.id}/learn/${firstLessonId(course)}`}
										className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
									>
										Continue learning
									</Link>
									<Link
										href={`/courses/${course.id}`}
										className="rounded-lg border border-edge px-4 py-2 text-sm font-medium hover:bg-canvas"
									>
										Overview
									</Link>
								</div>
							</CardBody>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function firstLessonId(course: Course): number {
	if (course.lessonIds.length > 0) return course.lessonIds[0];
	return 0;
}

export default function MyCoursesPage() {
	return (
		<RequireRole roles={["student"]}>
			<MyCourses />
		</RequireRole>
	);
}
