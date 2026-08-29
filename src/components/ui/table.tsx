import type { ReactNode } from "react";

export function Table({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className="card-surface overflow-x-auto">
			<table className={`w-full text-sm ${className}`}>{children}</table>
		</div>
	);
}

export function THead({ children }: { children: ReactNode }) {
	return (
		<thead className="border-b border-edge bg-canvas text-left text-xs uppercase tracking-wide text-ink-muted">
			{children}
		</thead>
	);
}

export function TBody({ children }: { children: ReactNode }) {
	return <tbody className="divide-y divide-edge">{children}</tbody>;
}

export function TR({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <tr className={`hover:bg-canvas/60 ${className}`}>{children}</tr>;
}

export function TH({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>
	);
}

export function TD({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

export function EmptyRow({
	colSpan,
	message,
}: {
	colSpan: number;
	message: string;
}) {
	return (
		<tr>
			<td
				colSpan={colSpan}
				className="px-4 py-10 text-center text-ink-muted"
			>
				{message}
			</td>
		</tr>
	);
}
