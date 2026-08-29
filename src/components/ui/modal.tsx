"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "./button";

export function Modal({
	open,
	onClose,
	title,
	children,
	footer,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<div
				className="card-surface w-full max-w-lg shadow-xl"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between border-b border-edge px-5 py-4">
					<h3 className="text-section-title">{title}</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-1 text-ink-muted hover:bg-canvas hover:text-ink"
						aria-label="Close"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
						>
							<title>Close</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="max-h-[65vh] overflow-y-auto px-5 py-4">
					{children}
				</div>
				{footer && (
					<div className="flex justify-end gap-2 border-t border-edge px-5 py-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}

export function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Delete",
	loading = false,
}: {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	loading?: boolean;
}) {
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={onConfirm}
						loading={loading}
					>
						{confirmLabel}
					</Button>
				</>
			}
		>
			<p className="text-sm text-ink-muted">{message}</p>
		</Modal>
	);
}
