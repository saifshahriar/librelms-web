"use client";

import { faImage, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { uploadService } from "@/lib/api/upload";
import { cn } from "@/lib/utils";

/**
 * Direct file upload for images (course/blog covers).
 * Uploads immediately to the backend and reports the media id + url.
 */
export function ImageUpload({
	value,
	onChange,
	label = "Cover image",
	className,
}: {
	value: { url: string; id: number | null } | null;
	onChange: (v: { url: string; id: number | null } | null) => void;
	label?: string;
	className?: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function pick(file: File) {
		setBusy(true);
		setError(null);
		try {
			const res = await uploadService.upload(file);
			onChange({
				url: res.data.urls[0],
				id: res.data.ids[0],
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className={className}>
			<span className="mb-2 flex items-center gap-2 text-sm leading-none font-medium select-none">
				{label}
			</span>
			<div className="flex items-start gap-3">
				{value?.url ? (
					<div className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-border">
						<img
							src={mediaSrc(value.url)}
							alt="Cover preview"
							className="h-full w-full object-cover"
						/>
						<button
							type="button"
							onClick={() => onChange(null)}
							className="absolute top-1 right-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
							aria-label="Remove image"
						>
							<FontAwesomeIcon
								icon={faXmark}
								className="size-3"
							/>
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={busy}
						className={cn(
							"flex h-24 w-40 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-brand-500 hover:bg-muted/50",
							busy && "opacity-60",
						)}
					>
						<FontAwesomeIcon
							icon={busy ? faSpinner : faImage}
							spin={busy}
							className="size-4"
						/>
						<span className="text-xs font-medium">
							{busy ? "Uploading" : "Upload image"}
						</span>
					</button>
				)}
				{!value?.url && (
					<p className="pt-1 text-xs text-muted-foreground/70">
						PNG or JPG. Directly uploaded to the platform, no
						external links.
					</p>
				)}
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) void pick(file);
					e.target.value = "";
				}}
			/>
			{error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
		</div>
	);
}

function mediaSrc(url: string) {
	if (url.startsWith("http")) return url;
	return `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337").replace(/\/$/, "")}${url}`;
}
