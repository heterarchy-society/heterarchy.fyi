/** Strip wiki-links, markdown links, bold/italic, inline code from a string. */
export function stripMarkdown(text: string): string {
	return text
		.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1') // [[link]] or [[link|label]]
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')           // [text](url)
		.replace(/\*\*?([^*]+)\*\*?/g, '$1')               // **bold** / *italic*
		.replace(/`[^`]+`/g, '')                            // `code`
		.trim();
}

/** Return the first paragraph of text (up to the first blank line), with markdown stripped. */
export function firstParagraph(text: string | undefined): string {
	if (!text) return '';
	const plain = stripMarkdown(text);
	const paraEnd = plain.search(/\n\n|\n#+/);
	return (paraEnd > 0 ? plain.slice(0, paraEnd) : plain).trim();
}
