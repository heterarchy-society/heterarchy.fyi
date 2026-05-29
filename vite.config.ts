import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

const csPathMap: Record<string, string> = {
	'/books': '/knihy',
	'/events': '/udalosti',
	'/join': '/zapojit-se',
	'/find-us': '/najdete-nas',
	'/about': '/o-nas',
	'/open-data': '/otevrena-data',
	'/writings': '/texty',
	'/people': '/lide',
	'/talks': '/prednasky',
};

type UrlPattern = { pattern: string; localized: ['en' | 'cs', string][] };

function makeUrlPatterns(): UrlPattern[] {
	const patterns: UrlPattern[] = [];

	for (const [enPath, csPath] of Object.entries(csPathMap)) {
		patterns.push({
			pattern: `:protocol://:domain(.*)::port?${enPath}/:rest(.*)`,
			localized: [
				['cs', `:protocol://:domain(.*)::port?/cs${csPath}/:rest(.*)`],
				['en', `:protocol://:domain(.*)::port?${enPath}/:rest(.*)`],
			],
		});
		patterns.push({
			pattern: `:protocol://:domain(.*)::port?${enPath}`,
			localized: [
				['cs', `:protocol://:domain(.*)::port?/cs${csPath}`],
				['en', `:protocol://:domain(.*)::port?${enPath}`],
			],
		});
	}

	// Glossary sub-routes (history, missing, term detail)
	patterns.push({
		pattern: ':protocol://:domain(.*)::port?/glossary/missing',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs/glosar/chybi'],
			['en', ':protocol://:domain(.*)::port?/glossary/missing'],
		],
	});
patterns.push({
		pattern: ':protocol://:domain(.*)::port?/glossary/:id/history',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs/glosar/:id/historie'],
			['en', ':protocol://:domain(.*)::port?/glossary/:id/history'],
		],
	});
	patterns.push({
		pattern: ':protocol://:domain(.*)::port?/glossary/:id',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs/glosar/:id'],
			['en', ':protocol://:domain(.*)::port?/glossary/:id'],
		],
	});
	patterns.push({
		pattern: ':protocol://:domain(.*)::port?/glossary',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs/glosar'],
			['en', ':protocol://:domain(.*)::port?/glossary'],
		],
	});

	// Czech homepage /cs and /cs/
	patterns.push({
		pattern: ':protocol://:domain(.*)::port?/',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs'],
			['en', ':protocol://:domain(.*)::port?/'],
		],
	});

	// Catch-all: /cs/* ↔ /*
	patterns.push({
		pattern: ':protocol://:domain(.*)::port?/:path(.*)?',
		localized: [
			['cs', ':protocol://:domain(.*)::port?/cs/:path(.*)'],
			['en', ':protocol://:domain(.*)::port?/:path(.*)'],
		],
	});

	return patterns;
}

export default defineConfig({
	resolve: {
		dedupe: ['@inlang/paraglide-js'],
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale'],
			urlPatterns: makeUrlPatterns(),
		})
	]
});
