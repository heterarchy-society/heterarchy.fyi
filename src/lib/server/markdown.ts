import { marked } from 'marked';
import type { Tokens } from 'marked';
import { getSingletonHighlighter, bundledLanguages } from 'shiki';
import { _markdownRenderer as renderer, _renderFootnotes as renderFootnotes } from '$lib/markdown';

const highlighterPromise = getSingletonHighlighter({ themes: ['min-light', 'min-dark'], langs: [] });

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

renderer.code = function (token: Tokens.Code & { _shikiHtml?: string }): string {
	if (token._shikiHtml) return token._shikiHtml;
	const langClass = token.lang ? ` class="language-${token.lang}"` : '';
	return `<pre><code${langClass}>${escapeHtml(token.text)}</code></pre>`;
};

export async function renderMarkdown(source: string): Promise<string> {
	const highlighter = await highlighterPromise;

	return await marked.parse(renderFootnotes(source), {
		async: true,
		renderer,
		walkTokens: async (token) => {
			if (token.type !== 'code') return;
			const lang = (token.lang ?? '').toLowerCase().split(/\s/)[0];
			try {
				if (lang && lang in bundledLanguages) {
					await highlighter.loadLanguage(lang as keyof typeof bundledLanguages);
				}
				(token as Tokens.Code & { _shikiHtml?: string })._shikiHtml = highlighter.codeToHtml(token.text, {
					lang: lang && lang in bundledLanguages ? lang : 'text',
					themes: { light: 'min-light', dark: 'min-dark' },
					defaultColor: false,
					transformers: [{
						pre(node) {
							node.properties.style = '';
							delete node.properties.tabindex;
						}
					}]
				});
			} catch {
				// fall through to default renderer
			}
		},
	}) as string;
}
