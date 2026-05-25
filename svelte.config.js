import adapter from '@sveltejs/adapter-static';
import { createRequire } from 'module';
const { version } = createRequire(import.meta.url)('./package.json');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html'
		}),
		paths: {
			base: process.env.BASE_PATH ?? ''
		},
		version: {
			name: version,
			pollInterval: 60_000
		},
		prerender: {
			handleHttpError: ({ message }) => {
				// Ignore 404s for paths not part of this site (e.g. external wiki links in glossary)
				if (message.includes('404')) return;
				throw new Error(message);
			},
			entries: [
				// English routes
				'/',
				'/books',
				'/glossary',
				'/events',
				'/join',
				'/find-us',
				'/open-data',
				'/data',
				'/writings',
				'/writings/changelog',
				'/about',
				// Czech routes
				'/cs',
				'/cs/knihy',
				'/cs/texty',
				'/cs/texty/changelog',
				'/cs/glosar',
				'/cs/udalosti',
				'/cs/zapojit-se',
				'/cs/najdete-nas',
				'/cs/otevrena-data',
				'/cs/data',
				'/cs/o-nas',
				// Crawl all linked pages from these entry points
				'*',
			]
		}
	}
};

export default config;
