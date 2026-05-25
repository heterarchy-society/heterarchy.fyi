import { marked } from 'marked';
import { getSingletonHighlighter, bundledLanguages } from 'shiki';
import { _markdownRenderer as renderer, _renderFootnotes as renderFootnotes } from '$lib/markdown';

const highlighterPromise = getSingletonHighlighter({ themes: ['min-light', 'min-dark'], langs: [] });

renderer.code = function (token: marked.Tokens.Code & { _shikiHtml?: string }): string {
	if (token._shikiHtml) return token._shikiHtml;
	const langClass = token.lang ? ` class="language-${token.lang}"` : '';
	const escaped = token.text.replace(/[&<>"']/g, (c) =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c
	);
	return `<pre><code${langClass}>${escaped}</code></pre>`;
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
				(token as any)._shikiHtml = highlighter.codeToHtml(token.text, {
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
