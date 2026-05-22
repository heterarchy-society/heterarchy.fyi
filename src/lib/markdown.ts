import { Renderer, marked } from 'marked';
import type { Tokens } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: false
});

const renderer = new Renderer();

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			case "'":
				return '&#39;';
			default:
				return char;
		}
	});
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

renderer.link = function ({ href, title, tokens }: Tokens.Link): string {
	const text = this.parser.parseInline(tokens);
	const safeHref = escapeHtml(href);
	const safeTitle = title ? ` title="${escapeHtml(title)}"` : '';

	if (!isExternalHref(href)) {
		return `<a href="${safeHref}"${safeTitle}>${text}</a>`;
	}

	return `<a href="${safeHref}"${safeTitle} class="link-external" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

export function renderMarkdown(source: string): string {
	return marked.parse(source, { async: false, renderer }) as string;
}
