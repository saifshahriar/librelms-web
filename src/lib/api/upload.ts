import { apiFetch } from "./client";

export interface UploadResult {
	urls: string[];
	ids: number[];
	names: string[];
}

export const uploadService = {
	/** Multipart upload; staff-only route. Returns id+url per file. */
	upload(file: File): Promise<{ data: UploadResult }> {
		const form = new FormData();
		form.append("files", file);
		return apiFetch<{ data: UploadResult }>("/api/platform/upload", {
			method: "POST",
			body: form,
		});
	},
};

/**
 * Media urls from the backend are root-relative (/uploads/x.png).
 * Resolve them against the API base for display.
 */
export function mediaUrl(url?: string | null): string {
	if (!url) return "";
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337";
	return `${base.replace(/\/$/, "")}${url}`;
}
