"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { courseService, enrollmentService, lessonService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Course, Lesson } from "@/lib/types";

export default function CourseDetailPage() {
	const params = useParams<{ id: string }>();
	const courseId = Number.parseInt(params.id, 10);
	const router = useRouter();
	const { user } = useAuth();

	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [enrolling, setEnrolling] = useState(false);
	const [enrolled, setEnrolled] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const c = await courseService.get(courseId);
				setCourse(c.data);
				if (user?.role === "student") {
					try {
						const l = await lessonService.list(courseId);
						setLessons(l.data);
						setEnrolled(true);
					} catch {
						setEnrolled(false);
					}
				}
			} finally {
				setLoading(false);
			}
		}
		if (!Number.isNaN(courseId)) load();
	}, [courseId, user?.role]);

	async function onEnroll() {
		setEnrolling(true);
		setError(null);
		try {
			await enrollmentService.enroll(courseId);
			setEnrolled(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Enrollment failed");
		} finally {
			setEnrolling(false);
		}
	}

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="card-surface h-64 animate-pulse" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="container-page py-20 text-center text-ink-muted">
				Course not found.
			</div>
		);
	}

	return (
		<div className="container-page py-10">
			<Link
				href="/courses"
				className="text-sm text-brand-600 hover:underline"
			>
				← Back to courses
			</Link>
			<div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div>
					<h1 className="text-page-title">{course.title}</h1>
					<p className="mt-3 whitespace-pre-line text-ink-muted">
						{course.description}
					</p>

					<Card className="mt-8">
						<CardHeader>
							<CardTitle>Lessons</CardTitle>
						</CardHeader>
						<CardBody className="p-0">
							{user?.role === "student" && !enrolled ? (
								<p className="px-5 py-8 text-center text-sm text-ink-muted">
									Enroll to access the lessons of this course.
								</p>
							) : lessons.length === 0 ? (
								<p className="px-5 py-8 text-center text-sm text-ink-muted">
									No lessons yet.
								</p>
							) : (
								<ol className="divide-y divide-edge">
									{lessons.map((lesson) => (
										<li
											key={lesson.id}
											className="flex items-center gap-3 px-5 py-3"
										>
											<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
												{lesson.order}
											</span>
											<div className="min-w-0 flex-1">
												<div className="truncate font-medium">
													{lesson.title}
												</div>
												<div className="text-xs text-ink-faint">
													{lesson.content.kind ===
													"video"
														? "Video"
														: "Reading"}
												</div>
											</div>
											{user?.role === "student" &&
												enrolled && (
													<Link
														href={`/courses/${courseId}/learn/${lesson.id}`}
														className="text-sm font-medium text-brand-600 hover:underline"
													>
														Open →
													</Link>
												)}
										</li>
									))}
								</ol>
							)}
						</CardBody>
					</Card>
				</div>

				<div>
					<Card>
						<CardBody className="space-y-3">
							<div className="flex flex-wrap gap-2">
								<Badge tone="brand">
									{course.lessonIds.length} lessons
								</Badge>
								{course.quizIds.length > 0 && (
									<Badge tone="purple">
										{course.quizIds.length} quizzes
									</Badge>
								)}
							</div>
							{user === null && (
								<Button
									className="w-full"
									onClick={() =>
										router.push(
											`/login?next=${encodeURIComponent(`/courses/${courseId}`)}`,
										)
									}
								>
									Log in to enroll
								</Button>
							)}
							{user?.role === "student" &&
								(enrolled ? (
									<Link
										href="/my/courses"
										className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700"
									>
										Enrolled ✓ — go to My Courses
									</Link>
								) : (
									<Button
										className="w-full"
										onClick={onEnroll}
										loading={enrolling}
									>
										Enroll in this course
									</Button>
								))}
							{error && (
								<p className="text-sm text-red-600">{error}</p>
							)}
							{(user?.role === "admin" ||
								user?.role === "content_manager" ||
								user?.role === "instructor") && (
								<Link
									href={`/manage/courses/${courseId}`}
									className="block rounded-lg border border-edge px-4 py-2 text-center text-sm font-medium hover:bg-canvas"
								>
									Manage this course
								</Link>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
