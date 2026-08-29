"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Badge, Button, Card, CardBody, ProgressBar } from "@/components/ui";
import {
	completionService,
	courseService,
	type LessonCompletion,
	lessonService,
} from "@/lib/api";
import { faArrowLeft, faArrowRight, faCheck } from "@/lib/icons";
import type { Course, CourseProgress, Lesson } from "@/lib/types";

function LessonViewer() {
	const params = useParams<{ id: string; lessonId: string }>();
	const courseId = Number.parseInt(params.id, 10);
	const lessonId = Number.parseInt(params.lessonId, 10);
	const router = useRouter();

	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [progress, setProgress] = useState<CourseProgress | null>(null);
	const [completions, setCompletions] = useState<LessonCompletion[]>([]);
	const [loading, setLoading] = useState(true);
	const [marking, setMarking] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const [c, l, p, done] = await Promise.all([
					courseService.get(courseId),
					lessonService.list(courseId),
					courseService.myProgress(courseId),
					completionService.mine(),
				]);
				setCourse(c.data);
				setLessons(l.data);
				setProgress(p.data);
				setCompletions(done.data);
			} catch {
				setError("Could not load this lesson. Are you enrolled?");
			} finally {
				setLoading(false);
			}
		}
		if (!Number.isNaN(courseId) && !Number.isNaN(lessonId)) load();
	}, [courseId, lessonId]);

	const ordered = [...lessons].sort((a, b) => a.order - b.order);
	const currentIndex = ordered.findIndex((l) => l.id === lessonId);
	const lesson = ordered[currentIndex];
	const prev = ordered[currentIndex - 1];
	const next = ordered[currentIndex + 1];

	const completedLessonIds = new Set(completions.map((c) => c.lessonId));
	const completedThis = completedLessonIds.has(lessonId);

	async function markComplete() {
		setMarking(true);
		setError(null);
		try {
			const done = await completionService.complete(lessonId);
			setCompletions((prev) => [...prev, done.data]);
			const p = await courseService.myProgress(courseId);
			setProgress(p.data);
			if (next) router.push(`/courses/${courseId}/learn/${next.id}`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to mark complete",
			);
		} finally {
			setMarking(false);
		}
	}

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="border border-border rounded-xl bg-card h-96 animate-pulse" />
			</div>
		);
	}

	if (error || !course || !lesson) {
		return (
			<div className="container-page py-20 text-center">
				<h1 className="text-page-title">
					{error ?? "Lesson not found"}
				</h1>
				<Link
					href="/my/courses"
					className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
				>
					Back to My Courses
				</Link>
			</div>
		);
	}

	return (
		<div className="container-page grid max-w-6xl gap-8 py-10 lg:grid-cols-[1fr_300px]">
			<div>
				<Link
					href={`/courses/${courseId}`}
					className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
				>
					<FontAwesomeIcon icon={faArrowLeft} className="size-3.5" />
					{course.title}
				</Link>
				<div className="mt-3 flex items-center gap-3">
					<Badge variant="brand">Lesson {lesson.order}</Badge>
					<Badge
						variant={
							lesson.content.kind === "video"
								? "purple"
								: "secondary"
						}
					>
						{lesson.content.kind === "video" ? "Video" : "Reading"}
					</Badge>
				</div>
				<h1 className="mt-2 text-page-title">{lesson.title}</h1>

				<Card className="mt-6">
					<CardBody>
						{lesson.content.kind === "video" ? (
							<div className="aspect-video overflow-hidden rounded-lg bg-slate-900">
								<iframe
									src={embedUrl(lesson.content.videoUrl)}
									title={lesson.title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									className="h-full w-full"
								/>
							</div>
						) : (
							<div className="whitespace-pre-line leading-relaxed text-foreground">
								{lesson.content.body}
							</div>
						)}
					</CardBody>
				</Card>

				<div className="mt-6 flex items-center justify-between">
					{prev ? (
						<Link
							href={`/courses/${courseId}/learn/${prev.id}`}
							className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
						>
							<span className="inline-flex items-center gap-1.5">
								<FontAwesomeIcon
									icon={faArrowLeft}
									className="size-3.5"
								/>
								Previous
							</span>
						</Link>
					) : (
						<span />
					)}
					<Button onClick={markComplete} loading={marking}>
						{completedThis ? (
							<span className="inline-flex items-center gap-1.5">
								<FontAwesomeIcon
									icon={faCheck}
									className="size-3.5"
								/>
								Completed
							</span>
						) : (
							"Mark as complete"
						)}
					</Button>
					{next ? (
						<Link
							href={`/courses/${courseId}/learn/${next.id}`}
							className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
						>
							<span className="inline-flex items-center gap-1.5">
								Next
								<FontAwesomeIcon
									icon={faArrowRight}
									className="size-3.5"
								/>
							</span>
						</Link>
					) : (
						<span />
					)}
				</div>
			</div>

			<aside>
				<Card>
					<CardBody>
						<h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Course progress
						</h3>
						{progress && (
							<>
								<div className="mb-1.5 flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										{progress.completedLessons}/
										{progress.totalLessons} lessons
									</span>
									<span className="font-semibold text-brand-700">
										{progress.percent}%
									</span>
								</div>
								<ProgressBar value={progress.percent} />
							</>
						)}
						<ol className="mt-4 space-y-1.5">
							{ordered.map((l) => {
								const done = completedLessonIds.has(l.id);
								const current = l.id === lessonId;
								return (
									<li key={l.id}>
										<Link
											href={`/courses/${courseId}/learn/${l.id}`}
											className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
												current
													? "bg-brand-50 font-medium text-brand-700"
													: "text-muted-foreground hover:bg-muted/50"
											}`}
										>
											<span
												className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
													done
														? "bg-emerald-100 text-emerald-700"
														: "bg-slate-100 text-muted-foreground/70"
												}`}
											>
												{done ? (
													<FontAwesomeIcon
														icon={faCheck}
														className="size-2.5"
													/>
												) : (
													l.order
												)}
											</span>
											<span className="truncate">
												{l.title}
											</span>
										</Link>
									</li>
								);
							})}
						</ol>
					</CardBody>
				</Card>
			</aside>
		</div>
	);
}

function embedUrl(videoUrl: string): string {
	const youtube = videoUrl.match(
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
	);
	if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
	return videoUrl;
}

export default function LearnPage() {
	return (
		<RequireRole roles={["student"]}>
			<LessonViewer />
		</RequireRole>
	);
}
