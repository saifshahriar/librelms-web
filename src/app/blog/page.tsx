"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, CardBody } from "@/components/ui";
import { postService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { canWritePosts } from "@/lib/permissions";
import type { Post } from "@/lib/types";

export default function BlogListPage() {
	const { user } = useAuth();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const showDrafts = canWritePosts(user);

	useEffect(() => {
		postService
			.list({ drafts: showDrafts })
			.then((res) => setPosts(res.data))
			.finally(() => setLoading(false));
	}, [showDrafts]);

	return (
		<div className="container-page py-10">
			<div className="mb-8 flex items-end justify-between">
				<div>
					<h1 className="text-page-title">Blog</h1>
					<p className="mt-1 text-ink-muted">
						News, guides and announcements from the LibreLMS team.
					</p>
				</div>
				{showDrafts && (
					<Link
						href="/manage/blog"
						className="rounded-lg border border-edge px-4 py-2 text-sm font-medium hover:bg-canvas"
					>
						Manage posts
					</Link>
				)}
			</div>

			{loading ? (
				<div className="space-y-4">
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="card-surface h-28 animate-pulse"
						/>
					))}
				</div>
			) : posts.length === 0 ? (
				<div className="card-surface px-6 py-16 text-center text-ink-muted">
					No posts yet.
				</div>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<Link key={post.id} href={`/blog/${post.documentId}`}>
							<Card className="transition-shadow hover:shadow-md">
								<CardBody>
									<div className="flex items-start justify-between gap-4">
										<div>
											<div className="flex items-center gap-2">
												{post.publishedAt === null && (
													<Badge tone="warning">
														Draft
													</Badge>
												)}
											</div>
											<h2 className="mt-1 text-lg font-semibold">
												{post.title}
											</h2>
											<p className="mt-1 line-clamp-2 text-sm text-ink-muted">
												{post.body}
											</p>
											<p className="mt-2 text-xs text-ink-faint">
												{post.authorName} ·{" "}
												{new Date(
													post.publishedAt ??
														post.createdAt,
												).toLocaleDateString()}
											</p>
										</div>
									</div>
								</CardBody>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
