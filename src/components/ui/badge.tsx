import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "purple";

const tones: Record<Tone, string> = {
	neutral: "bg-slate-100 text-slate-700",
	brand: "bg-brand-50 text-brand-700",
	success: "bg-emerald-100 text-emerald-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
	purple: "bg-violet-100 text-violet-700",
};

export function Badge({
	tone = "neutral",
	className = "",
	children,
}: {
	tone?: Tone;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
		>
			{children}
		</span>
	);
}
