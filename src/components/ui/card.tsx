import type { ReactNode } from "react";

export function Card({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <div className={`card-surface ${className}`}>{children}</div>;
}

export function CardHeader({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={`border-b border-edge px-5 py-4 ${className}`}>
			{children}
		</div>
	);
}

export function CardTitle({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <h3 className={`text-section-title ${className}`}>{children}</h3>;
}

export function CardBody({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({
	className = "",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={`border-t border-edge px-5 py-3 ${className}`}>
			{children}
		</div>
	);
}
