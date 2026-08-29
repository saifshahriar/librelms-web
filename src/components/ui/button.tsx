"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
};

const variants: Record<Variant, string> = {
	primary:
		"bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500/40",
	secondary:
		"border border-edge bg-surface text-ink hover:bg-canvas focus-visible:ring-brand-500/30",
	danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40",
	ghost: "text-ink hover:bg-canvas focus-visible:ring-brand-500/30",
};

const sizes: Record<Size, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-4 text-sm",
};

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	className = "",
	disabled,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
			disabled={disabled || loading}
			{...props}
		>
			{loading && (
				<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
			)}
			{children}
		</button>
	);
}
