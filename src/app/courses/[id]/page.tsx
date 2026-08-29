"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockedOverlay } from "@/components/locked-overlay";
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
import { faArrowLeft, faArrowRight } from "@/lib/icons";
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
	const [permissionMessage, setPermissionMessage] = useState<string | null>(
		null,
	);

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
				} else if (user?.role === "instructor") {
					try {
						const l = await lessonService.list(courseId);
						setLessons(l.data);
					} catch {
						setPermissionMessage(
							"You don't have permission to view this course",
						);
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
				<div className="border border-border rounded-xl bg-card h-64 animate-pulse" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="container-page py-20 text-center text-muted-foreground">
				Course not found.
			</div>
		);
	}

	return (
		<div className="container-page py-10">
			<Link
				href="/courses"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
			>
				<FontAwesomeIcon icon={faArrowLeft} className="size-3.5" />
				Back to courses
			</Link>
			<div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div>
					<h1 className="text-page-title">{course.title}</h1>
					<p className="mt-3 whitespace-pre-line text-muted-foreground">
						{course.description}
					</p>

					<Card className="mt-8">
						<CardHeader>
							<CardTitle>Lessons</CardTitle>
						</CardHeader>
						<CardBody className="p-0">
							{permissionMessage ? (
								<LockedOverlay message={permissionMessage}>
									<ol className="divide-y divide-border">
										{[1, 2, 3].map((i) => (
											<li
												key={i}
												className="flex items-center gap-3 px-5 py-3.5"
											>
												<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
													{i}
												</span>
												<div className="min-w-0 flex-1 space-y-1.5">
													<div className="h-3 w-1/3 rounded bg-muted" />
													<div className="h-2 w-1/5 rounded bg-muted/70" />
												</div>
											</li>
										))}
									</ol>
								</LockedOverlay>
							) : user?.role === "student" && !enrolled ? (
								<p className="px-6 py-10 text-center text-sm text-muted-foreground">
									Enroll to access the lessons of this course.
								</p>
							) : lessons.length === 0 ? (
								<p className="px-6 py-10 text-center text-sm text-muted-foreground">
									No lessons yet.
								</p>
							) : (
								<ol className="divide-y divide-border">
									{lessons.map((lesson) => (
										<li
											key={lesson.id}
											className="flex items-center gap-3 px-5 py-3.5"
										>
											<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
												{lesson.order}
											</span>
											<div className="min-w-0 flex-1">
												<div className="truncate font-medium">
													{lesson.title}
												</div>
												<div className="text-xs text-muted-foreground/70">
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
														<span className="inline-flex items-center gap-1">
															Open
															<FontAwesomeIcon
																icon={
																	faArrowRight
																}
																className="size-3"
															/>
														</span>
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
								<Badge variant="brand">
									{course.lessonIds.length} lessons
								</Badge>
								{course.quizIds.length > 0 && (
									<Badge variant="purple">
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
										Enrolled, go to My Courses
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
								(user?.role === "instructor" &&
									course.instructorIds.includes(
										user.id,
									))) && (
								<Link
									href={`/manage/courses/${courseId}`}
									className="block rounded-lg border border-border px-4 py-2 text-center text-sm font-medium hover:bg-muted/50"
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
