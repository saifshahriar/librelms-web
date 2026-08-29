export function ProgressBar({
	value,
	className = "",
}: {
	value: number;
	className?: string;
}) {
	const clamped = Math.max(0, Math.min(100, Math.round(value)));
	return (
		<div
			className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
			role="progressbar"
			aria-valuenow={clamped}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className="h-full rounded-full bg-brand-600 transition-all duration-300"
				style={{ width: `${clamped}%` }}
			/>
		</div>
	);
}
