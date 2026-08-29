"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[65vh] space-y-1 overflow-y-auto">
					{children}
				</div>
				{footer && <DialogFooter>{footer}</DialogFooter>}
				<DialogDescription className="sr-only">
					{title}
				</DialogDescription>
			</DialogContent>
		</Dialog>
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
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						loading={loading}
					>
						{confirmLabel}
					</Button>
				</>
			}
		>
			<p className="text-sm text-muted-foreground">{message}</p>
		</Modal>
	);
}
