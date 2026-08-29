import type { TextareaHTMLAttributes } from "react";

export function Textarea({
	className = "",
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea className={`input-base ${className}`} {...props} />;
}
