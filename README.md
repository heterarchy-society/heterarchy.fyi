# heterarchy.fyi

Website for [The Heterarchy Society](https://heterarchy.fyi), built with SvelteKit and Tailwind CSS.

The site is a static Svelte app with pages for the homepage, events, library, platforms, joining the community, and about content. Most editable content lives in TypeScript data files under `src/lib/data`, with visual components in `src/lib/components`.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev) — app framework with file-based routing and static adapter
- [Svelte 5](https://svelte.dev) — UI with runes (`$state`, `$derived`, `$effect`)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vite](https://vite.dev)
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) — i18n with URL-prefix routing (`/` EN, `/cs/` CS)
- [Bun](https://bun.sh) — package manager and script runner
- [`@pierre/diffs`](https://www.npmjs.com/package/@pierre/diffs) — git diff rendering in glossary history
- [Fuse.js](https://www.fusejs.io) — fuzzy search with diacritic folding for the universal search (`⌘K`)

## Getting Started

Install dependencies:

```sh
bun install
```

Start the local development server:

```sh
make dev
```

Run type and Svelte checks:

```sh
make check
```

Create a production build:

```sh
make build
```

Preview the production build locally:

```sh
make preview
```

Run `make help` to see all available targets.

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

The project uses `@sveltejs/adapter-static`. Running `make build` (or `bun run build`) writes the static site to `build/`, which can be deployed to any static hosting provider. CI/CD uses GitHub Actions with [`oven-sh/setup-bun`](https://github.com/oven-sh/setup-bun) and deploys to GitHub Pages automatically on push to `main`.

If the site is deployed under a subpath, set `BASE_PATH` before building.
