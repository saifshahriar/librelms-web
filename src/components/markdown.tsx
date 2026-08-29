import ReactMarkdown from "react-markdown";

/**
 * Renders trusted first-party content (lesson bodies, blog posts) as
 * markdown. No HTML is passed through, so it is safe for staff-authored
 * course content. Links open in a new tab.
 */
export function Markdown({ text }: { text: string }) {
	return (
		<div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand-700 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-muted">
			<ReactMarkdown
				components={{
					a: (props) => (
						<a
							{...props}
							target="_blank"
							rel="noopener noreferrer"
						/>
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
