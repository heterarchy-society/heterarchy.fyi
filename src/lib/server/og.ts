import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { siteMeta } from '$lib/data/placeholder';

const require = createRequire(import.meta.url);
const decompressWoff2 = require('wawoff2/decompress.js') as (buffer: Buffer) => Promise<Uint8Array>;

export const ogImageSize = {
	width: 1200,
	height: 630,
};

export type OgImageInput = {
	collection: string;
	title: string;
	description?: string | null;
	meta?: string[];
	avatarUrl?: string | null;
};

type OgElement = {
	type: string;
	props: Record<string, unknown>;
};

const fontFiles = {
	inter: fileURLToPath(new URL('../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff', import.meta.url)),
	interBold: fileURLToPath(new URL('../../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff', import.meta.url)),
	mono: fileURLToPath(new URL('../../../static/fonts/jetbrains-mono/JetBrainsMono-SemiBold.woff2', import.meta.url)),
};

const logoFile = fileURLToPath(new URL('../../../static/logo.svg', import.meta.url));

let fontsPromise: Promise<Awaited<Parameters<typeof satori>[1]['fonts']>> | null = null;
let logoPathPromise: Promise<string> | null = null;
const imageDataCache = new Map<string, Promise<string | null>>();

function loadFonts() {
	fontsPromise ??= Promise.all([
		readFile(fontFiles.inter),
		readFile(fontFiles.interBold),
		readFile(fontFiles.mono),
	]).then(async ([inter, interBold, monoWoff2]) => {
		const mono = await decompressWoff2(monoWoff2);

		return [
			{
				name: 'Inter',
				data: inter,
				weight: 400,
				style: 'normal',
			},
			{
				name: 'Inter',
				data: interBold,
				weight: 700,
				style: 'normal',
			},
			{
				name: 'JetBrains Mono',
				data: Buffer.from(mono),
				weight: 400,
				style: 'normal',
			},
			{
				name: 'JetBrains Mono',
				data: Buffer.from(mono),
				weight: 600,
				style: 'normal',
			},
		];
	});
	return fontsPromise;
}

function loadLogoPath() {
	logoPathPromise ??= readFile(logoFile, 'utf8').then((svg) => {
		const path = svg.match(/<path\s+d="([^"]+)"/)?.[1];
		if (!path) throw new Error('Logo SVG path not found');
		return path;
	});
	return logoPathPromise;
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]): OgElement {
	const filteredChildren = children.filter((child) => child !== null && child !== undefined && child !== false);
	return {
		type,
		props: {
			...props,
			...(filteredChildren.length > 0
				? { children: filteredChildren.length === 1 ? filteredChildren[0] : filteredChildren }
				: {}),
		},
	};
}

function cleanText(text: string | null | undefined): string {
	return (text ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, '$1')
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[*_`#>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

export function ogImagePath(collection: string, id: string): string {
	return `/og/${collection}/${id}.png`;
}

function loadImageData(url: string | null | undefined): Promise<string | null> {
	if (!url) return Promise.resolve(null);
	let promise = imageDataCache.get(url);
	if (!promise) {
		promise = fetch(url)
			.then(async (response) => {
				if (!response.ok) return null;
				const contentType = response.headers.get('content-type') ?? 'image/jpeg';
				const bytes = Buffer.from(await response.arrayBuffer());
				return `data:${contentType};base64,${bytes.toString('base64')}`;
			})
			.catch(() => null);
		imageDataCache.set(url, promise);
	}
	return promise;
}

function metaRow(meta: string[] | undefined, avatar: string | null): OgElement {
	const items = meta?.filter(Boolean).map((item) => item.toUpperCase()) ?? [];
	const children: unknown[] = [];

	if (avatar) {
		children.push(h('img', {
			src: avatar,
			width: 34,
			height: 34,
			style: {
				width: '34px',
				height: '34px',
				objectFit: 'cover',
				marginRight: '12px',
			},
		}));
	}

	items.forEach((item, index) => {
		if (index > 0) {
			children.push(h('div', {
				style: {
					width: '5px',
					height: '5px',
					borderRadius: '999px',
					backgroundColor: '#8b8175',
					marginLeft: '16px',
					marginRight: '16px',
				},
			}));
		}
		children.push(h('div', { style: { display: 'flex' } }, item));
	});

	return h('div', {
		style: {
			display: 'flex',
			alignItems: 'center',
			fontFamily: 'JetBrains Mono',
			fontSize: '21px',
			textTransform: 'uppercase',
			letterSpacing: '0.08em',
			color: '#6d6359',
		},
	}, ...children);
}

export async function renderOgImage(input: OgImageInput): Promise<ArrayBuffer> {
	const [fonts, logoPath, avatar] = await Promise.all([
		loadFonts(),
		loadLogoPath(),
		loadImageData(input.avatarUrl),
	]);
	const description = truncate(cleanText(input.description), 360);
	const descriptionFontSize = description.length > 260 ? 25 : description.length > 190 ? 27 : 30;

	const svg = await satori(
		h(
			'div',
			{
				style: {
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					backgroundColor: '#f6f1e7',
					color: '#111111',
					fontFamily: 'Inter',
					padding: '72px 64px 54px',
					position: 'relative',
				},
			},
			h('div', {
				style: {
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '16px',
					background: 'linear-gradient(90deg, #111111 0%, #111111 46%, #cc3f2f 46%, #cc3f2f 70%, #227c88 70%, #227c88 100%)',
				},
			}),
			h(
				'div',
				{
					style: {
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						gap: '32px',
					},
				},
				metaRow(input.meta, avatar),
				h('div', {
					style: {
						fontFamily: 'JetBrains Mono',
						fontSize: '24px',
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						color: '#227c88',
					},
				}, input.collection)
			),
			h(
				'div',
				{
					style: {
						display: 'flex',
						flexDirection: 'column',
						gap: '34px',
						maxWidth: '1010px',
						marginTop: '18px',
					},
				},
				h('div', {
					style: {
						fontSize: '74px',
						lineHeight: 1.02,
						fontWeight: 700,
						letterSpacing: '0',
					},
				}, truncate(cleanText(input.title), 108)),
				description
					? h('div', {
						style: {
							maxWidth: '980px',
							color: '#3f3a34',
							fontSize: `${descriptionFontSize}px`,
							lineHeight: 1.34,
						},
					}, description)
					: null
			),
			h(
				'div',
				{ style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' } },
				h('div', {
					style: {
						fontFamily: 'JetBrains Mono',
						fontSize: '23px',
						color: '#111111',
					},
				}, siteMeta.title),
				h('svg', {
					viewBox: '0 0 1254 1254',
					style: {
						width: '126px',
						height: '126px',
					},
				}, h('g', {
					transform: 'translate(0,1254) scale(0.1,-0.1)',
				}, h('path', {
					d: logoPath,
					fill: '#111111',
				})))
			)
		),
		{
			...ogImageSize,
			fonts,
		}
	);

	const png = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: ogImageSize.width,
		},
	}).render().asPng();
	return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}
