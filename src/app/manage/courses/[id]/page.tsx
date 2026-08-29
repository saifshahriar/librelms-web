"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import {
	Button,
	Card,
	CardBody,
	ConfirmModal,
	Input,
	Label,
	Modal,
	ProgressBar,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "@/components/ui";
import { courseService, lessonService, quizService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ownsCourse } from "@/lib/permissions";
import type { Course, Lesson, Quiz, StudentProgress } from "@/lib/types";

/* ---------- lesson editor modal ---------- */

function LessonModal({
	open,
	onClose,
	courseId,
	lesson,
	onSaved,
}: {
	open: boolean;
	onClose: () => void;
	courseId: number;
	lesson: Lesson | null;
	onSaved: (l: Lesson, isNew: boolean) => void;
}) {
	const [title, setTitle] = useState("");
	const [kind, setKind] = useState<"text" | "video">("text");
	const [body, setBody] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setTitle(lesson?.title ?? "");
		setKind(lesson?.content.kind ?? "text");
		setBody(lesson?.content.kind === "text" ? lesson.content.body : "");
		setVideoUrl(
			lesson?.content.kind === "video" ? lesson.content.videoUrl : "",
		);
		setError(null);
	}, [open, lesson]);

	async function save() {
		setSaving(true);
		setError(null);
		try {
			if (lesson) {
				const res = await lessonService.update(lesson.id, {
					title,
					kind,
					body: kind === "text" ? body : undefined,
					videoUrl: kind === "video" ? videoUrl : undefined,
				});
				onSaved(res.data, false);
			} else {
				const res = await lessonService.create({
					courseId,
					title,
					kind,
					body: kind === "text" ? body : undefined,
					videoUrl: kind === "video" ? videoUrl : undefined,
				});
				onSaved(res.data, true);
			}
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save lesson",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={lesson ? "Edit lesson" : "Add lesson"}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={save}
						loading={saving}
						disabled={!title.trim()}
					>
						{lesson ? "Save" : "Add lesson"}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="lesson-title">Title</Label>
					<Input
						id="lesson-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Lesson title"
					/>
				</div>
				<div>
					<Label htmlFor="lesson-kind">Content type</Label>
					<Select
						value={kind}
						onValueChange={(v) => setKind(v as "text" | "video")}
					>
						<SelectTrigger id="lesson-kind" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="text">Text</SelectItem>
							<SelectItem value="video">Video URL</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{kind === "text" ? (
					<div>
						<Label htmlFor="lesson-body">Content</Label>
						<Textarea
							id="lesson-body"
							rows={8}
							value={body}
							onChange={(e) => setBody(e.target.value)}
							placeholder="Lesson content in plain text…"
						/>
					</div>
				) : (
					<div>
						<Label htmlFor="lesson-video">Video URL</Label>
						<Input
							id="lesson-video"
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=…"
						/>
					</div>
				)}
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</Modal>
	);
}

/* ---------- quiz editor modal ---------- */

interface DraftQuestion {
	text: string;
	options: { text: string; isCorrect: boolean }[];
}

function QuizModal({
	open,
	onClose,
	courseId,
	quiz,
	onSaved,
}: {
	open: boolean;
	onClose: () => void;
	courseId: number;
	quiz: Quiz | null;
	onSaved: (q: Quiz, isNew: boolean) => void;
}) {
	const [title, setTitle] = useState("");
	const [questions, setQuestions] = useState<DraftQuestion[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setTitle(quiz?.title ?? "");
		setQuestions(
			quiz
				? quiz.questions.map((q) => ({
						text: q.text,
						options: q.options.map((o) => ({
							text: o.text,
							isCorrect: o.isCorrect ?? false,
						})),
					}))
				: [{ text: "", options: [{ text: "", isCorrect: false }] }],
		);
		setError(null);
	}, [open, quiz]);

	function setQuestionText(i: number, text: string) {
		setQuestions((qs) =>
			qs.map((q, idx) => (idx === i ? { ...q, text } : q)),
		);
	}

	function setOption(qi: number, oi: number, text: string) {
		setQuestions((qs) =>
			qs.map((q, idx) =>
				idx === qi
					? {
							...q,
							options: q.options.map((o, oidx) =>
								oidx === oi ? { ...o, text } : o,
							),
						}
					: q,
			),
		);
	}

	function markCorrect(qi: number, oi: number) {
		setQuestions((qs) =>
			qs.map((q, idx) =>
				idx === qi
					? {
							...q,
							options: q.options.map((o, oidx) => ({
								...o,
								isCorrect: oidx === oi,
							})),
						}
					: q,
			),
		);
	}

	function addQuestion() {
		setQuestions((qs) => [
			...qs,
			{ text: "", options: [{ text: "", isCorrect: false }] },
		]);
	}

	function removeQuestion(i: number) {
		setQuestions((qs) => qs.filter((_, idx) => idx !== i));
	}

	function addOption(qi: number) {
		setQuestions((qs) =>
			qs.map((q, idx) =>
				idx === qi
					? {
							...q,
							options: [
								...q.options,
								{ text: "", isCorrect: false },
							],
						}
					: q,
			),
		);
	}

	function removeOption(qi: number, oi: number) {
		setQuestions((qs) =>
			qs.map((q, idx) =>
				idx === qi
					? {
							...q,
							options: q.options.filter((_, oidx) => oidx !== oi),
						}
					: q,
			),
		);
	}

	async function save() {
		setSaving(true);
		setError(null);
		try {
			if (quiz) {
				const res = await quizService.update(quiz.id, {
					title,
					questions,
				});
				onSaved(res.data, false);
			} else {
				const res = await quizService.create({
					courseId,
					title,
					questions,
				});
				onSaved(res.data, true);
			}
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save quiz",
			);
		} finally {
			setSaving(false);
		}
	}

	const valid =
		title.trim() !== "" &&
		questions.length > 0 &&
		questions.every(
			(q) =>
				q.text.trim() !== "" &&
				q.options.length >= 2 &&
				q.options.every((o) => o.text.trim() !== "") &&
				q.options.some((o) => o.isCorrect),
		);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={quiz ? "Edit quiz" : "Create quiz"}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={save} loading={saving} disabled={!valid}>
						{quiz ? "Save" : "Create quiz"}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="quiz-title">Quiz title</Label>
					<Input
						id="quiz-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Module 1 check"
					/>
				</div>
				{questions.map((q, qi) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: draft rows are addressed by index in state
						key={qi}
						className="rounded-lg border border-border p-3"
					>
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold text-muted-foreground">
								Q{qi + 1}
							</span>
							<Input
								value={q.text}
								onChange={(e) =>
									setQuestionText(qi, e.target.value)
								}
								placeholder="Question text"
							/>
							<button
								type="button"
								onClick={() => removeQuestion(qi)}
								className="rounded p-1 text-sm text-red-500 hover:bg-red-50"
								aria-label={`Remove question ${qi + 1}`}
							>
								✕
							</button>
						</div>
						<div className="mt-2 space-y-2">
							{q.options.map((o, oi) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: draft rows are addressed by index in state
									key={oi}
									className="flex items-center gap-2"
								>
									<input
										type="radio"
										name={`correct-${qi}`}
										checked={o.isCorrect}
										onChange={() => markCorrect(qi, oi)}
										className="h-4 w-4 accent-emerald-600"
										aria-label={`Correct answer ${oi + 1}`}
									/>
									<Input
										value={o.text}
										onChange={(e) =>
											setOption(qi, oi, e.target.value)
										}
										placeholder={`Option ${oi + 1}`}
									/>
									<button
										type="button"
										onClick={() => removeOption(qi, oi)}
										className="rounded p-1 text-xs text-muted-foreground/70 hover:bg-muted/50 hover:text-red-500"
										aria-label={`Remove option ${oi + 1}`}
									>
										✕
									</button>
								</div>
							))}
						</div>
						<div className="mt-2 flex items-center justify-between">
							<button
								type="button"
								onClick={() => addOption(qi)}
								className="text-xs font-medium text-brand-600 hover:underline"
							>
								+ option
							</button>
							{!q.options.some((o) => o.isCorrect) && (
								<span className="text-xs text-amber-600">
									Mark one option correct
								</span>
							)}
						</div>
					</div>
				))}
				<button
					type="button"
					onClick={addQuestion}
					className="w-full rounded-lg border border-dashed border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50"
				>
					+ Add question
				</button>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</Modal>
	);
}

/* ---------- main management page ---------- */

function CourseManagePageInner() {
	const params = useParams<{ id: string }>();
	const courseId = Number.parseInt(params.id, 10);
	const router = useRouter();
	const { user } = useAuth();

	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [students, setStudents] = useState<StudentProgress[]>([]);
	const [loading, setLoading] = useState(true);
	const [denied, setDenied] = useState(false);

	const [showLessonModal, setShowLessonModal] = useState(false);
	const [editLesson, setEditLesson] = useState<Lesson | null>(null);
	const [showQuizModal, setShowQuizModal] = useState(false);
	const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Lesson | Quiz | null>(
		null,
	);
	const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);

	useEffect(() => {
		async function load() {
			try {
				const c = await courseService.get(courseId);
				setCourse(c.data);
				if (!ownsCourse(user, c.data)) {
					setDenied(true);
					return;
				}
				const [l, q, s] = await Promise.all([
					lessonService.list(courseId),
					quizService.list(courseId),
					courseService.studentProgress(courseId).catch(() => null),
				]);
				setLessons(l.data);
				setQuizzes(q.data);
				if (s) setStudents(s.data);
			} finally {
				setLoading(false);
			}
		}
		if (!Number.isNaN(courseId) && user) load();
	}, [courseId, user]);

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="border border-border rounded-xl bg-card h-96 animate-pulse" />
			</div>
		);
	}

	if (denied || !course) {
		return (
			<div className="container-page py-20 text-center">
				<h1 className="text-page-title">
					{denied
						? "You can only manage your own courses."
						: "Course not found."}
				</h1>
				<Link
					href="/manage/courses"
					className="mt-4 inline-block text-brand-600 hover:underline"
				>
					← Back to courses
				</Link>
			</div>
		);
	}

	async function deleteLesson(lesson: Lesson) {
		await lessonService.remove(lesson.id);
		setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
		setDeleteTarget(null);
	}

	async function deleteQuiz(quiz: Quiz) {
		await quizService.remove(quiz.id);
		setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
		setDeleteTarget(null);
	}

	async function deleteCourse() {
		if (!course) return;
		await courseService.remove(course.id);
		router.push("/manage/courses");
	}

	return (
		<div className="container-page max-w-5xl py-10">
			<Link
				href="/manage/courses"
				className="text-sm text-brand-600 hover:underline"
			>
				← Manage courses
			</Link>
			<div className="mt-3 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-page-title">{course.title}</h1>
					<p className="mt-1 max-w-2xl text-muted-foreground">
						{course.description}
					</p>
				</div>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => setDeleteCourseOpen(true)}
				>
					Delete course
				</Button>
			</div>

			{/* Lessons */}
			<Card className="mt-8">
				<CardBody>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-section-title">
							Lessons ({lessons.length})
						</h2>
						<Button
							size="sm"
							onClick={() => {
								setEditLesson(null);
								setShowLessonModal(true);
							}}
						>
							+ Add lesson
						</Button>
					</div>
					{lessons.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No lessons yet — add the first one.
						</p>
					) : (
						<ol className="divide-y divide-edge rounded-lg border border-border">
							{[...lessons]
								.sort((a, b) => a.order - b.order)
								.map((lesson) => (
									<li
										key={lesson.id}
										className="flex items-center gap-3 px-4 py-3"
									>
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
											{lesson.order}
										</span>
										<div className="min-w-0 flex-1">
											<div className="truncate font-medium">
												{lesson.title}
											</div>
											<div className="text-xs text-muted-foreground/70">
												{lesson.content.kind === "video"
													? "Video"
													: "Text"}
											</div>
										</div>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => {
												setEditLesson(lesson);
												setShowLessonModal(true);
											}}
										>
											Edit
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() =>
												setDeleteTarget(lesson)
											}
										>
											Delete
										</Button>
									</li>
								))}
						</ol>
					)}
				</CardBody>
			</Card>

			{/* Quizzes */}
			<Card className="mt-6">
				<CardBody>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-section-title">
							Quizzes ({quizzes.length})
						</h2>
						<Button
							size="sm"
							onClick={() => {
								setEditQuiz(null);
								setShowQuizModal(true);
							}}
						>
							+ Create quiz
						</Button>
					</div>
					{quizzes.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No quizzes yet — create an MCQ quiz for this course.
						</p>
					) : (
						<ul className="divide-y divide-edge rounded-lg border border-border">
							{quizzes.map((quiz) => (
								<li
									key={quiz.id}
									className="flex items-center gap-3 px-4 py-3"
								>
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium">
											{quiz.title}
										</div>
										<div className="text-xs text-muted-foreground/70">
											{quiz.questions.length} questions
										</div>
									</div>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => {
											setEditQuiz(quiz);
											setShowQuizModal(true);
										}}
									>
										Edit
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => setDeleteTarget(quiz)}
									>
										Delete
									</Button>
								</li>
							))}
						</ul>
					)}
				</CardBody>
			</Card>

			{/* Student progress */}
			<Card className="mt-6">
				<CardBody>
					<h2 className="mb-4 text-section-title">
						Student progress ({students.length} enrolled)
					</h2>
					{students.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No students enrolled yet.
						</p>
					) : (
						<ul className="space-y-3">
							{students.map((s) => (
								<li
									key={s.user.id}
									className="flex items-center gap-4"
								>
									<div className="min-w-0 flex-1">
										<div className="font-medium">
											{s.user.fullName ?? s.user.username}
										</div>
										<div className="text-xs text-muted-foreground/70">
											{s.user.email}
										</div>
									</div>
									<div className="w-48">
										<div className="mb-1 flex justify-between text-xs text-muted-foreground">
											<span>
												{s.completedLessons}/
												{s.totalLessons} lessons
											</span>
											<span className="font-semibold text-brand-700">
												{s.percent}%
											</span>
										</div>
										<ProgressBar value={s.percent} />
									</div>
								</li>
							))}
						</ul>
					)}
				</CardBody>
			</Card>

			<LessonModal
				open={showLessonModal}
				onClose={() => setShowLessonModal(false)}
				courseId={courseId}
				lesson={editLesson}
				onSaved={(l, isNew) => {
					if (isNew) setLessons((prev) => [...prev, l]);
					else
						setLessons((prev) =>
							prev.map((x) => (x.id === l.id ? l : x)),
						);
				}}
			/>
			<QuizModal
				open={showQuizModal}
				onClose={() => setShowQuizModal(false)}
				courseId={courseId}
				quiz={editQuiz}
				onSaved={(q, isNew) => {
					if (isNew) setQuizzes((prev) => [...prev, q]);
					else
						setQuizzes((prev) =>
							prev.map((x) => (x.id === q.id ? q : x)),
						);
				}}
			/>
			<ConfirmModal
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (!deleteTarget) return;
					if ("content" in deleteTarget)
						void deleteLesson(deleteTarget);
					else void deleteQuiz(deleteTarget);
				}}
				title="Confirm delete"
				message={`Delete "${deleteTarget ? ("content" in deleteTarget ? deleteTarget.title : deleteTarget.title) : ""}"? This cannot be undone.`}
			/>
			<ConfirmModal
				open={deleteCourseOpen}
				onClose={() => setDeleteCourseOpen(false)}
				onConfirm={deleteCourse}
				title="Delete course"
				message={`Delete "${course.title}" with all its lessons and quizzes? This cannot be undone.`}
				confirmLabel="Delete course"
			/>
		</div>
	);
}

export default function CourseManagePage() {
	return (
		<RequireRole roles={["admin", "content_manager", "instructor"]}>
			<CourseManagePageInner />
		</RequireRole>
	);
}
