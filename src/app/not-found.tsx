import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faCompass } from "@/lib/icons";

export default function NotFound() {
	return (
		<div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-full bg-muted">
				<FontAwesomeIcon
					icon={faCompass}
					className="size-7 text-muted-foreground"
				/>
			</div>
			<div className="space-y-2">
				<h1 className="text-page-title">404: Page not found</h1>
				<p className="mx-auto max-w-md text-sm text-muted-foreground">
					The page you are looking for doesn&apos;t exist.
				</p>
			</div>
			<Link
				href="/"
				className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Go home
			</Link>
		</div>
	);
}
