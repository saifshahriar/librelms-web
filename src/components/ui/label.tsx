import type { LabelHTMLAttributes } from "react";

export function Label({
	className = "",
	...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: generic passthrough label; association happens at usage site via htmlFor
		<label className={`label-base ${className}`} {...props} />
	);
}
