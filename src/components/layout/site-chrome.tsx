"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/types";

const publicLinks = [
	{ href: "/", label: "Home" },
	{ href: "/courses", label: "Courses" },
	{ href: "/blog", label: "Blog" },
];

function navLinksFor(
	role: string | undefined,
): { href: string; label: string }[] {
	if (!role) return publicLinks;
	if (role === "admin")
		return [
			...publicLinks,
			{ href: "/admin", label: "Admin" },
			{ href: "/admin/users", label: "Users" },
		];
	if (role === "content_manager" || role === "instructor")
		return [
			...publicLinks,
			{ href: "/manage/courses", label: "Manage" },
			...(role === "content_manager"
				? [{ href: "/manage/blog", label: "Blog Posts" }]
				: []),
		];
	return [
		...publicLinks,
		{ href: "/my/courses", label: "My Courses" },
		{ href: "/my/results", label: "My Results" },
	];
}

export function SiteHeader() {
	const { user, logout } = useAuth();
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const links = navLinksFor(user?.role);

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
			<div className="container-page flex h-14 items-center justify-between gap-4">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="flex items-center gap-2 font-bold text-brand-700"
					>
						<svg
							className="h-6 w-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>LibreLMS</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 6.25327C13.1684 5.54129 14.7515 5 16.5 5C19.9376 5 22.5 6.34315 22.5 8V17C22.5 18.6569 19.9376 20 16.5 20C14.7515 20 13.1684 19.4587 12 18.7467C10.8316 19.4587 9.24853 20 7.5 20C4.06239 20 1.5 18.6569 1.5 17V8C1.5 6.34315 4.06239 5 7.5 5C9.24853 5 10.8316 5.54129 12 6.25327Z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 6.25327V18.7467"
							/>
						</svg>
						<span>LibreLMS</span>
					</Link>
					<nav className="hidden items-center gap-1 sm:flex">
						{links.map((l) => (
							<Link
								key={l.href}
								href={l.href}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
									pathname === l.href
										? "bg-brand-50 text-brand-700"
										: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
								}`}
							>
								{l.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-3">
					{user ? (
						<>
							<div className="hidden text-right sm:block">
								<div className="text-sm font-medium">
									{user.fullName ?? user.username}
								</div>
								<div className="text-xs text-muted-foreground">
									{ROLE_LABELS[user.role]}
								</div>
							</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={logout}
							>
								Log out
							</Button>
						</>
					) : (
						<div className="flex items-center gap-2">
							<Link href="/login">
								<Button variant="ghost" size="sm">
									Log in
								</Button>
							</Link>
							<Link href="/register">
								<Button size="sm">Sign up</Button>
							</Link>
						</div>
					)}
					<button
						type="button"
						className="rounded-md p-2 text-muted-foreground hover:bg-muted/50 sm:hidden"
						onClick={() => setOpen((v) => !v)}
						aria-label="Toggle menu"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
						>
							<title>Menu</title>
							{open ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>
			{open && (
				<nav className="border-t border-border bg-background px-4 py-2 sm:hidden">
					{links.map((l) => (
						<Link
							key={l.href}
							href={l.href}
							onClick={() => setOpen(false)}
							className={`block rounded-md px-3 py-2 text-sm font-medium ${
								pathname === l.href
									? "bg-brand-50 text-brand-700"
									: "text-muted-foreground hover:bg-muted/50"
							}`}
						>
							{l.label}
						</Link>
					))}
					{user && (
						<button
							type="button"
							onClick={() => {
								logout();
								setOpen(false);
							}}
							className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted/50"
						>
							Log out
						</button>
					)}
				</nav>
			)}
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
				<div>LibreLMS, open learning platform</div>
				<div>Built with Next.js</div>
			</div>
		</footer>
	);
}
