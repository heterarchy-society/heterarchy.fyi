import { Renderer, marked } from 'marked';
import type { Tokens } from 'marked';
import katex from 'katex';

const renderer = new Renderer();

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case '&': return '&amp;';
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '"': return '&quot;';
			case "'": return '&#39;';
			default:  return char;
		}
	});
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

function cleanUrl(href: string): string | null {
	let encoded: string;
	try {
		encoded = encodeURI(href).replace(/%25/g, '%');
	} catch {
		return null;
	}
	if (/^[a-z][a-z\d+\-.]*:/i.test(encoded)) {
		try {
			new URL(encoded);
		} catch {
			return null;
		}
	}
	return encoded;
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
	const cleaned = cleanUrl(href);
	if (cleaned === null) return text;
	const safeHref = escapeHtml(cleaned);
	const safeTitle = title ? ` title="${escapeHtml(title)}"` : '';
	if (!isExternalHref(href)) {
		return `<a href="${safeHref}"${safeTitle}>${text}</a>`;
	}
	return `<a href="${safeHref}"${safeTitle} class="link-external" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use({
	gfm: true,
	breaks: false,
	extensions: [
		{
			name: 'blockMath',
			level: 'block',
			start(src: string) { return src.indexOf('$$'); },
			tokenizer(src: string) {
				const match = src.match(/^\$\$([\s\S]+?)\$\$/);
				if (match) return { type: 'blockMath', raw: match[0], math: match[1].trim() };
			},
			renderer(token: any) {
				try {
					return `<div class="math-block">${katex.renderToString(token.math, { displayMode: true, throwOnError: false })}</div>`;
				} catch {
					return `<div class="math-block math-error"><code>$$${token.math}$$</code></div>`;
				}
			}
		},
		{
			name: 'inlineMath',
			level: 'inline',
			start(src: string) { return src.indexOf('$'); },
			tokenizer(src: string) {
				const match = src.match(/^\$([^$\n]+?)\$/);
				if (match) return { type: 'inlineMath', raw: match[0], math: match[1].trim() };
			},
			renderer(token: any) {
				try {
					return katex.renderToString(token.math, { displayMode: false, throwOnError: false });
				} catch {
					return `<code>$${token.math}$</code>`;
				}
			}
		}
	]
});

export { renderer as _markdownRenderer, renderFootnotes as _renderFootnotes };

export function renderMarkdown(source: string): string {
	return marked.parse(renderFootnotes(source), { async: false, renderer }) as string;
}

export function renderMarkdownInline(source: string): string {
	return marked.parseInline(source, { async: false, renderer }) as string;
}
