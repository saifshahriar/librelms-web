"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { Badge, Card, CardBody } from "@/components/ui";
import { quizService } from "@/lib/api";
import type { QuizResult } from "@/lib/types";

function ResultsHistory() {
	const [results, setResults] = useState<QuizResult[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		quizService
			.myResults()
			.then((res) => setResults(res.data))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="container-page py-10">
			<h1 className="text-page-title mb-2">My Quiz Results</h1>
			<p className="mb-8 text-muted-foreground">
				Your quiz scores are stored and viewable any time.
			</p>

			{loading ? (
				<div className="space-y-3">
					{[0, 1].map((i) => (
						<div
							key={i}
							className="border border-border rounded-xl bg-card h-20 animate-pulse"
						/>
					))}
				</div>
			) : results.length === 0 ? (
				<div className="border border-border rounded-xl bg-card px-6 py-16 text-center">
					<p className="text-muted-foreground">
						You haven&apos;t taken any quiz yet.
					</p>
					<Link
						href="/my/courses"
						className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
					>
						Go to My Courses
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{results.map((r) => {
						const percent = Math.round((r.score / r.total) * 100);
						return (
							<Card key={r.id}>
								<CardBody className="flex items-center justify-between">
									<div>
										<div className="font-semibold">
											{r.quizTitle}
										</div>
										<div className="mt-0.5 text-sm text-muted-foreground">
											{r.courseTitle}{" "}
											<span className="text-muted-foreground/40">
												|
											</span>{" "}
											{new Date(
												r.submittedAt,
											).toLocaleString()}
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge
											variant={
												percent >= 80
													? "success"
													: percent >= 50
														? "warning"
														: "danger"
											}
										>
											{percent}%
										</Badge>
										<div className="text-right">
											<div className="text-lg font-bold">
												{r.score}
											</div>
											<div className="text-xs text-muted-foreground/70">
												of {r.total}
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function MyResultsPage() {
	return (
		<RequireRole roles={["student"]}>
			<ResultsHistory />
		</RequireRole>
	);
}
