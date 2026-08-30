"use client";

import {
	faFileVideo,
	faSpinner,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { uploadService } from "@/lib/api/upload";
import { cn } from "@/lib/utils";

/**
 * Direct file upload for lesson videos. Uploads immediately and hands
 * the media id (and url fallback) back to the form.
 */
export function VideoUpload({
	value,
	onChange,
	className,
}: {
	value: { url: string; id: number | null } | null;
	onChange: (v: { url: string; id: number | null } | null) => void;
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
				Video file
			</span>
			{value?.url ? (
				<div className="flex items-center gap-3 rounded-lg border border-border p-2.5">
					<FontAwesomeIcon
						icon={faFileVideo}
						className="size-4 shrink-0 text-brand-600"
					/>
					<span className="min-w-0 flex-1 truncate text-sm">
						{value.url.split("/").pop()}
					</span>
					<button
						type="button"
						onClick={() => onChange(null)}
						className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-red-500"
						aria-label="Remove video"
					>
						<FontAwesomeIcon icon={faXmark} className="size-3.5" />
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={busy}
					className={cn(
						"flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-brand-500 hover:bg-muted/50",
						busy && "opacity-60",
					)}
				>
					<FontAwesomeIcon
						icon={busy ? faSpinner : faFileVideo}
						spin={busy}
						className="size-4"
					/>
					{busy ? "Uploading video" : "Upload video file"}
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="video/*"
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
