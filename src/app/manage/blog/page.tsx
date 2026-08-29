"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import {
	Badge,
	Button,
	Card,
	CardBody,
	ConfirmModal,
	Input,
	Label,
	Modal,
	Textarea,
} from "@/components/ui";
import { postService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Post } from "@/lib/types";

function PostEditor({
	open,
	onClose,
	post,
	onSaved,
}: {
	open: boolean;
	onClose: () => void;
	post: Post | null;
	onSaved: (p: Post, isNew: boolean) => void;
}) {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [coverImageUrl, setCoverImageUrl] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setTitle(post?.title ?? "");
		setBody(post?.body ?? "");
		setCoverImageUrl(post?.coverImageUrl ?? "");
		setError(null);
	}, [open, post]);

	async function save(published: boolean) {
		setSaving(true);
		setError(null);
		try {
			if (post) {
				const res = await postService.update(post.documentId, {
					title,
					body,
					coverImageUrl,
					published,
				});
				onSaved(res.data, false);
			} else {
				const res = await postService.create({
					title,
					body,
					coverImageUrl,
					published,
				});
				onSaved(res.data, true);
			}
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save post",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={post ? "Edit post" : "New post"}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="secondary"
						onClick={() => save(false)}
						loading={saving}
						disabled={!title.trim() || !body.trim()}
					>
						Save draft
					</Button>
					<Button
						onClick={() => save(true)}
						loading={saving}
						disabled={!title.trim() || !body.trim()}
					>
						{post?.publishedAt ? "Update & publish" : "Publish"}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="post-title">Title</Label>
					<Input
						id="post-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Post title"
					/>
				</div>
				<div>
					<Label htmlFor="post-body">Body</Label>
					<Textarea
						id="post-body"
						rows={10}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Write your post"
					/>
				</div>
				<div>
					<Label htmlFor="post-cover">
						Cover image URL (optional)
					</Label>
					<Input
						id="post-cover"
						value={coverImageUrl}
						onChange={(e) => setCoverImageUrl(e.target.value)}
						placeholder="https://"
					/>
				</div>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</Modal>
	);
}

function BlogManage() {
	const { user } = useAuth();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [showEditor, setShowEditor] = useState(false);
	const [editPost, setEditPost] = useState<Post | null>(null);
	const [deletePost, setDeletePost] = useState<Post | null>(null);

	useEffect(() => {
		postService
			.list({ drafts: true })
			.then((res) => setPosts(res.data))
			.finally(() => setLoading(false));
	}, []);

	function canEdit(post: Post): boolean {
		if (!user) return false;
		return user.role === "admin" || post.authorId === user.id;
	}

	async function togglePublish(post: Post) {
		const res = await postService.update(post.documentId, {
			published: post.publishedAt === null,
		});
		setPosts((prev) => prev.map((p) => (p.id === post.id ? res.data : p)));
	}

	async function onDelete() {
		if (!deletePost) return;
		await postService.remove(deletePost.documentId);
		setPosts((prev) => prev.filter((p) => p.id !== deletePost.id));
		setDeletePost(null);
	}

	return (
		<div className="container-page py-10">
			<div className="mb-8 flex items-end justify-between">
				<div>
					<h1 className="text-page-title">Blog posts</h1>
					<p className="mt-1 text-muted-foreground">
						Drafts are hidden from the public; publish to make them
						visible.
					</p>
				</div>
				<Button
					onClick={() => {
						setEditPost(null);
						setShowEditor(true);
					}}
				>
					+ New post
				</Button>
			</div>

			{loading ? (
				<div className="border border-border rounded-xl bg-card h-40 animate-pulse" />
			) : posts.length === 0 ? (
				<Card className="py-16 text-center text-muted-foreground">
					No posts yet.
				</Card>
			) : (
				<Card>
					<CardBody className="p-0">
						<table className="w-full text-sm">
							<thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
								<tr>
									<th className="px-4 py-3">Title</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3">Author</th>
									<th className="px-4 py-3" />
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{posts.map((post) => (
									<tr
										key={post.id}
										className="hover:bg-muted/50/60"
									>
										<td className="px-4 py-3">
											<Link
												href={`/blog/${post.documentId}`}
												className="font-medium hover:text-brand-700 hover:underline"
											>
												{post.title}
											</Link>
										</td>
										<td className="px-4 py-3">
											{post.publishedAt ? (
												<Badge variant="success">
													Published
												</Badge>
											) : (
												<Badge variant="warning">
													Draft
												</Badge>
											)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{post.authorName}
										</td>
										<td className="px-4 py-3 text-right">
											{canEdit(post) && (
												<div className="flex justify-end gap-2">
													<Button
														variant="secondary"
														size="sm"
														onClick={() => {
															setEditPost(post);
															setShowEditor(true);
														}}
													>
														Edit
													</Button>
													<Button
														variant="secondary"
														size="sm"
														onClick={() =>
															togglePublish(post)
														}
													>
														{post.publishedAt
															? "Unpublish"
															: "Publish"}
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() =>
															setDeletePost(post)
														}
													>
														Delete
													</Button>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardBody>
				</Card>
			)}

			<PostEditor
				open={showEditor}
				onClose={() => setShowEditor(false)}
				post={editPost}
				onSaved={(p, isNew) => {
					if (isNew) setPosts((prev) => [p, ...prev]);
					else
						setPosts((prev) =>
							prev.map((x) => (x.id === p.id ? p : x)),
						);
				}}
			/>
			<ConfirmModal
				open={deletePost !== null}
				onClose={() => setDeletePost(null)}
				onConfirm={onDelete}
				title="Delete post"
				message={`Delete "${deletePost?.title ?? ""}"? This cannot be undone.`}
			/>
		</div>
	);
}

export default function ManageBlogPage() {
	return (
		<RequireRole roles={["admin", "content_manager"]}>
			<BlogManage />
		</RequireRole>
	);
}
