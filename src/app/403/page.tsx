import Link from "next/link";

export default function ForbiddenPage() {
	return (
		<div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<div className="text-6xl">🔒</div>
			<h1 className="text-page-title">403 — Access denied</h1>
			<p className="max-w-md text-ink-muted">
				You don&apos;t have permission to view this page. If you think
				you should, try logging in with a different account.
			</p>
			<div className="flex gap-3">
				<Link
					href="/"
					className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
				>
					Go home
				</Link>
				<Link
					href="/login"
					className="rounded-lg border border-edge px-4 py-2 text-sm font-medium hover:bg-canvas"
				>
					Log in
				</Link>
			</div>
		</div>
	);
}
