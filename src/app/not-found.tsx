import Link from "next/link";

export default function NotFound() {
	return (
		<div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<div className="text-6xl">🧭</div>
			<h1 className="text-page-title">404 — Page not found</h1>
			<p className="text-ink-muted">
				The page you are looking for doesn&apos;t exist.
			</p>
			<Link
				href="/"
				className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
			>
				Go home
			</Link>
		</div>
	);
}
