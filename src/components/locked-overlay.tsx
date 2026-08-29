import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@/lib/icons";

/**
 * Blurs restricted content and shows a lock badge on top of it.
 * Content stays in the DOM (skeleton, not secrets): render a
 * placeholder instead of the real data when it must not leak.
 */
export function LockedOverlay({
	message,
	children,
	className = "",
}: {
	message: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`relative overflow-hidden rounded-b-xl ${className}`}>
			<div
				aria-hidden="true"
				className="pointer-events-none select-none blur-sm opacity-60"
			>
				{children}
			</div>
			<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60 px-6 text-center backdrop-blur-[2px]">
				<div className="flex size-12 items-center justify-center rounded-full bg-muted ring-1 ring-foreground/10">
					<FontAwesomeIcon
						icon={faLock}
						className="size-5 text-muted-foreground"
					/>
				</div>
				<p className="max-w-sm text-sm font-medium text-muted-foreground">
					{message}
				</p>
			</div>
		</div>
	);
}
