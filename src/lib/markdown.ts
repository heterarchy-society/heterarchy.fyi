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

function renderFootnotes(source: string): string {
	const footnotes = new Map<string, string>();
	const withoutDefinitions = source.replace(
		/^\[\^([^\]]+)\]:[ \t]*(.*(?:\n(?!\n|\[\^[^\]]+\]:)[ \t]+.*)*)/gm,
		(_, id: string, body: string) => {
			footnotes.set(id, body.replace(/\n[ \t]+/g, ' ').trim());
			return '';
		}
	);

	const used: string[] = [];
	const withRefs = withoutDefinitions.replace(/\[\^([^\]]+)\]/g, (_, id: string) => {
		if (!footnotes.has(id)) return `[^${id}]`;
		if (!used.includes(id)) used.push(id);
		const number = used.indexOf(id) + 1;
		const safeId = id.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
		return `<sup id="fnref-${safeId}" class="footnote-ref"><a href="#fn-${safeId}">${number}</a></sup>`;
	});

	if (used.length === 0) return withRefs;

	const list = used.map((id) => {
		const number = used.indexOf(id) + 1;
		const safeId = id.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
		const html = marked.parseInline(footnotes.get(id) ?? '', { async: false, renderer }) as string;
		return `<li id="fn-${safeId}"><span class="footnote-number">${number}.</span> <span>${html}</span> <a href="#fnref-${safeId}" class="footnote-backref" aria-label="Back to reference ${number}">↩</a></li>`;
	}).join('\n');

	return `${withRefs.trimEnd()}\n\n<section class="footnotes">\n<ol>\n${list}\n</ol>\n</section>`;
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
	return marked.parse(renderFootnotes(source), { async: false, renderer }) as string;
}

export function renderMarkdownInline(source: string): string {
	return marked.parseInline(source, { async: false, renderer }) as string;
}
