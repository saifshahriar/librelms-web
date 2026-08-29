"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Modal,
} from "@/components/ui";
import { courseService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ownsCourse } from "@/lib/permissions";
import type { Course } from "@/lib/types";

function CreateCourseModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: (c: Course) => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	async function create() {
		setSaving(true);
		setError(null);
		try {
			const res = await courseService.create({ title, description });
			onCreated(res.data);
			setTitle("");
			setDescription("");
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to create course",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Create course"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={create}
						loading={saving}
						disabled={!title.trim()}
					>
						Create
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="course-title">Title</Label>
					<Input
						id="course-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Advanced React Patterns"
					/>
				</div>
				<div>
					<Label htmlFor="course-desc">Description</Label>
					<Input
						id="course-desc"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What will students learn?"
					/>
				</div>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</Modal>
	);
}

function ManageCourses() {
	const { user } = useAuth();
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreate, setShowCreate] = useState(false);

	useEffect(() => {
		courseService
			.list()
			.then((res) => setCourses(res.data))
			.finally(() => setLoading(false));
	}, []);

	// instructors only see their own courses
	const visible = courses.filter((c) => ownsCourse(user, c));

	return (
		<div className="container-page py-10">
			<div className="mb-8 flex items-end justify-between">
				<div>
					<h1 className="text-page-title">Manage courses</h1>
					<p className="mt-1 text-muted-foreground">
						{user?.role === "instructor"
							? "Your own courses."
							: "All courses on the platform."}
					</p>
				</div>
				<Button onClick={() => setShowCreate(true)}>
					+ New course
				</Button>
			</div>

			{loading ? (
				<div className="border border-border rounded-xl bg-card h-40 animate-pulse" />
			) : visible.length === 0 ? (
				<Card className="py-16 text-center text-muted-foreground">
					No courses yet.
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>{visible.length} courses</CardTitle>
					</CardHeader>
					<CardBody className="p-0">
						<table className="w-full text-sm">
							<thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
								<tr>
									<th className="px-4 py-3">Title</th>
									<th className="px-4 py-3">Lessons</th>
									<th className="px-4 py-3">Quizzes</th>
									<th className="px-4 py-3" />
								</tr>
							</thead>
							<tbody className="divide-y divide-edge">
								{visible.map((course) => (
									<tr
										key={course.id}
										className="hover:bg-muted/50/60"
									>
										<td className="px-4 py-3">
											<div className="font-medium">
												{course.title}
											</div>
											<div className="line-clamp-1 text-xs text-muted-foreground">
												{course.description}
											</div>
										</td>
										<td className="px-4 py-3">
											<Badge variant="brand">
												{course.lessonIds.length}
											</Badge>
										</td>
										<td className="px-4 py-3">
											<Badge variant="purple">
												{course.quizIds.length}
											</Badge>
										</td>
										<td className="px-4 py-3 text-right">
											<Link
												href={`/manage/courses/${course.id}`}
												className="font-medium text-brand-600 hover:underline"
											>
												Manage →
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardBody>
				</Card>
			)}

			<CreateCourseModal
				open={showCreate}
				onClose={() => setShowCreate(false)}
				onCreated={(c) => setCourses((prev) => [...prev, c])}
			/>
		</div>
	);
}

export default function ManageCoursesPage() {
	return (
		<RequireRole roles={["admin", "content_manager", "instructor"]}>
			<ManageCourses />
		</RequireRole>
	);
}
