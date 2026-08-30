import ReactMarkdown from "react-markdown";

/**
 * Renders trusted first-party content (lesson bodies, blog posts) as
 * markdown. No HTML is passed through, so it is safe for staff-authored
 * course content. Links open in a new tab.
 *
 * Code styling is explicit per element so inline chips and code blocks
 * can never bleed into each other: inline code renders as a small chip,
 * block code renders as a dark terminal panel.
 */
export function Markdown({ text }: { text: string }) {
	return (
		<div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand-700">
			<ReactMarkdown
				components={{
					a: (props) => (
						<a
							{...props}
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					pre: ({ children }) => (
						<pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-slate-800">
							{children}
						</pre>
					),
					code: ({ className, children }) =>
						className ? (
							// block code (has language-* class): inherits pre styling
							<code className="font-mono">{children}</code>
						) : (
							// inline code chip
							<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-brand-800">
								{children}
							</code>
						),
				}}
			>
				{text}
			</ReactMarkdown>
		</div>
	);
}

/**
 * One-line plain-text excerpt for cards and previews.
 * Strips markdown syntax instead of rendering it.
 */
export function excerpt(text: string, max = 160): string {
	const plain = text
		.replaceAll(/```[\s\S]*?```/g, " ")
		.replaceAll(/[*_`#>~]/g, "")
		.replaceAll(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
	if (plain.length <= max) return plain;
	return `${plain.slice(0, max).trimEnd()}...`;
}
