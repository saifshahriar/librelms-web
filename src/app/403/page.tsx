import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faLock } from "@/lib/icons";

export default function ForbiddenPage() {
	return (
		<div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-full bg-muted">
				<FontAwesomeIcon
					icon={faLock}
					className="size-7 text-muted-foreground"
				/>
			</div>
			<div className="space-y-2">
				<h1 className="text-page-title">403: Access denied</h1>
				<p className="mx-auto max-w-md text-sm text-muted-foreground">
					You don&apos;t have permission to view this page. If you
					think you should, try logging in with a different account.
				</p>
			</div>
			<div className="mt-2 flex gap-3">
				<Link
					href="/"
					className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Go home
				</Link>
				<Link
					href="/login"
					className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
				>
					Log in
				</Link>
			</div>
		</div>
	);
}
