import type { Post } from "@/lib/types";
import { apiFetch } from "./client";

interface ListResponse<T> {
	data: T[];
}

export const postService = {
	list(options?: { drafts?: boolean }) {
		const qs = options?.drafts ? "?publicationState=preview" : "";
		return apiFetch<ListResponse<Post>>(`/api/posts${qs}`);
	},

	get(ref: string) {
		return apiFetch<{ data: Post }>(`/api/posts/${ref}`);
	},

	create(input: {
		title: string;
		body: string;
		coverImageUrl?: string;
		published?: boolean;
	}) {
		return apiFetch<{ data: Post }>("/api/posts", {
			method: "POST",
			body: JSON.stringify(input),
		});
	},

	update(
		ref: string,
		input: {
			title?: string;
			body?: string;
			coverImageUrl?: string;
			published?: boolean;
		},
	) {
		return apiFetch<{ data: Post }>(`/api/posts/${ref}`, {
			method: "PUT",
			body: JSON.stringify(input),
		});
	},

	remove(ref: string) {
		return apiFetch<{ data: null }>(`/api/posts/${ref}`, {
			method: "DELETE",
		});
	},
};
