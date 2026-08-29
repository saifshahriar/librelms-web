"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui";
import { postService } from "@/lib/api";
import type { Post } from "@/lib/types";

export default function BlogPostPage() {
	const params = useParams<{ documentId: string }>();
	const [post, setPost] = useState<Post | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		postService
			.get(params.documentId)
			.then((res) => setPost(res.data))
			.catch(() => setNotFound(true))
			.finally(() => setLoading(false));
	}, [params.documentId]);

	if (loading) {
		return (
			<div className="container-page py-10">
				<div className="card-surface h-96 animate-pulse" />
			</div>
		);
	}

	if (notFound || !post) {
		return (
			<div className="container-page py-20 text-center">
				<h1 className="text-page-title">Post not found</h1>
				<p className="mt-2 text-ink-muted">
					It may be a draft or it was removed.{" "}
					<Link
						href="/blog"
						className="text-brand-600 hover:underline"
					>
						Back to blog
					</Link>
				</p>
			</div>
		);
	}

	return (
		<article className="container-page max-w-3xl py-10">
			<Link
				href="/blog"
				className="text-sm text-brand-600 hover:underline"
			>
				← Back to blog
			</Link>
			<div className="mt-4 flex items-center gap-2 text-sm text-ink-faint">
				<span>{post.authorName}</span>
				<span>·</span>
				<span>
					{new Date(
						post.publishedAt ?? post.createdAt,
					).toLocaleDateString()}
				</span>
				{post.publishedAt === null && (
					<Badge variant="warning">Draft</Badge>
				)}
			</div>
			<h1 className="mt-2 text-page-title">{post.title}</h1>
			{post.coverImageUrl && (
				// eslint-disable-next-line @next/next/no-img-element -- arbitrary external URLs, no domain allowlist config yet
				<img
					src={post.coverImageUrl}
					alt={post.title}
					className="mt-6 w-full rounded-xl border border-edge object-cover"
				/>
			)}
			<div className="prose prose-slate mt-8 whitespace-pre-line text-ink">
				{post.body}
			</div>
		</article>
	);
}
