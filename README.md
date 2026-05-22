# heterarchy.fyi

Website for The Heterarchy Society, built with SvelteKit and Tailwind CSS.

The site is a static Svelte app with pages for the homepage, events, library, platforms, joining the community, and about content. Most editable content lives in TypeScript data files under `src/lib/data`, with visual components in `src/lib/components`.

## Tech Stack

- SvelteKit
- Svelte 5 runes
- TypeScript
- Tailwind CSS
- Vite
- Static adapter output to `build/`

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Run type and Svelte checks:

```sh
npm run check
```

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Project Structure

```txt
src/routes/              SvelteKit pages and route layouts
src/lib/components/      Reusable UI components
src/lib/data/            Site content and catalog data
src/lib/content/         Markdown content
static/                  Static assets served from the site root
static/books/            Book cover images
build/                   Generated static site output
```

## Editing Content

- Books are defined in `src/lib/data/books.ts`.
- Library labels and helpers are in `src/lib/data/library.ts`.
- Events are defined in `src/lib/data/events.ts`.
- About, join, partner, contact, and homepage metadata live in the other files in `src/lib/data`.
- Public assets belong in `static/`; reference them from the app with root-relative paths such as `/books/example.jpg`.

## Deployment

The project uses `@sveltejs/adapter-static`. Running `npm run build` writes the static site to `build/`, which can be deployed to any static hosting provider.

If the site is deployed under a subpath, set `BASE_PATH` before building.
