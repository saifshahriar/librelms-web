"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Button, Card, CardBody, ProgressBar } from "@/components/ui";
import { quizService } from "@/lib/api";
import type { Quiz, QuizResult } from "@/lib/types";

function QuizTaker() {
	const params = useParams<{ id: string; quizId: string }>();
	const courseId = Number.parseInt(params.id, 10);
	const quizId = Number.parseInt(params.quizId, 10);

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [answers, setAnswers] = useState<number[]>([]);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		quizService
			.view(quizId)
			.then((res) => {
				setQuiz(res.data);
				setAnswers(new Array(res.data.questions.length).fill(-1));
			})
			.catch(() =>
				setError("Could not load this quiz. Are you enrolled?"),
			)
			.finally(() => setLoading(false));
	}, [quizId]);

	function choose(questionIndex: number, optionIndex: number) {
		setAnswers((a) =>
			a.map((v, i) => (i === questionIndex ? optionIndex : v)),
		);
	}

	async function submit() {
		setSubmitting(true);
		setError(null);
		try {
			const res = await quizService.submit(quizId, answers);
			setResult(res.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Submission failed");
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="card-surface h-96 animate-pulse" />
			</div>
		);
	}

	if (error && !quiz) {
		return (
			<div className="container-page py-20 text-center">
				<h1 className="text-page-title">{error}</h1>
				<Link
					href="/my/courses"
					className="mt-4 inline-block text-brand-600 hover:underline"
				>
					← Back to My Courses
				</Link>
			</div>
		);
	}

	if (!quiz) return null;

	const answeredCount = answers.filter((a) => a >= 0).length;
	const percent = Math.round((answeredCount / quiz.questions.length) * 100);

	if (result) {
		const scorePercent = Math.round((result.score / result.total) * 100);
		return (
			<div className="container-page max-w-2xl py-10">
				<Card>
					<CardBody className="text-center">
						<h1 className="text-page-title">Quiz submitted!</h1>
						<div className="mt-6 text-5xl font-bold text-brand-700">
							{result.score} / {result.total}
						</div>
						<p className="mt-2 text-ink-muted">
							{result.score}/{result.total} correct —{" "}
							{scorePercent}%
						</p>
						<div className="mx-auto mt-4 max-w-sm">
							<ProgressBar value={scorePercent} />
						</div>
						<div className="mt-8 space-y-3 text-left">
							{quiz.questions.map((question, qi) => {
								const chosen = answers[qi];
								const correct = result.correctAnswers[qi];
								return (
									<div
										key={question.id}
										className={`rounded-lg border p-3 ${
											chosen === correct
												? "border-emerald-200 bg-emerald-50"
												: "border-red-200 bg-red-50"
										}`}
									>
										<div className="text-sm font-medium">
											{qi + 1}. {question.text}
										</div>
										<div className="mt-1 text-sm text-ink-muted">
											You answered:{" "}
											{chosen >= 0
												? question.options[chosen]?.text
												: "—"}
										</div>
										{chosen !== correct && (
											<div className="mt-0.5 text-sm text-emerald-700">
												Correct:{" "}
												{
													question.options[correct]
														?.text
												}
											</div>
										)}
									</div>
								);
							})}
						</div>
						<div className="mt-8 flex justify-center gap-3">
							<Link
								href={`/courses/${courseId}`}
								className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
							>
								Back to course
							</Link>
							<Link
								href="/my/results"
								className="rounded-lg border border-edge px-4 py-2 text-sm font-medium hover:bg-canvas"
							>
								View all results
							</Link>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="container-page max-w-2xl py-10">
			<Link
				href={`/courses/${courseId}`}
				className="text-sm text-brand-600 hover:underline"
			>
				← Back to course
			</Link>
			<h1 className="mt-3 text-page-title">{quiz.title}</h1>
			<p className="mt-1 text-ink-muted">
				{quiz.questions.length} questions · answer all and submit for an
				instant score.
			</p>

			<div className="mt-8 space-y-4">
				{quiz.questions.map((question, qi) => (
					<Card key={question.id}>
						<CardBody>
							<div className="mb-3 flex items-start gap-2">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
									{qi + 1}
								</span>
								<div className="font-medium">
									{question.text}
								</div>
							</div>
							<div className="space-y-2">
								{question.options.map((option, oi) => {
									const selected = answers[qi] === oi;
									return (
										<button
											key={option.text}
											type="button"
											onClick={() => choose(qi, oi)}
											className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
												selected
													? "border-brand-500 bg-brand-50 font-medium"
													: "border-edge hover:bg-canvas"
											}`}
										>
											<span
												className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
													selected
														? "border-brand-600"
														: "border-slate-300"
												}`}
											>
												{selected && (
													<span className="h-2 w-2 rounded-full bg-brand-600" />
												)}
											</span>
											{option.text}
										</button>
									);
								})}
							</div>
						</CardBody>
					</Card>
				))}
			</div>

			<div className="mt-6 flex items-center justify-between">
				<div className="text-sm text-ink-muted">
					{answeredCount} of {quiz.questions.length} answered
					<span className="ml-3 inline-block w-24 align-middle">
						<ProgressBar value={percent} />
					</span>
				</div>
				<Button
					onClick={submit}
					loading={submitting}
					disabled={answeredCount < quiz.questions.length}
				>
					Submit quiz
				</Button>
			</div>
			{error && <p className="mt-3 text-sm text-red-600">{error}</p>}
		</div>
	);
}

export default function QuizPage() {
	return (
		<RequireRole roles={["student"]}>
			<QuizTaker />
		</RequireRole>
	);
}
