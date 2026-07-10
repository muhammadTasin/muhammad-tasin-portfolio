# Muhammad Tasin — Developer Portfolio

Source-controlled backup of Muhammad Tasin's current developer portfolio.

## Professional positioning

Muhammad Tasin is an AI-focused backend developer and full-stack and Flutter app developer. The portfolio presents selected work across LLM integration, RAG workflows, REST APIs, FastAPI, databases, Supabase, Flutter, React, and Next.js.

## Technology stack

- React 19 and Next.js 16 source conventions
- Vinext and Vite for the Cloudflare-compatible application build
- TypeScript and CSS
- Cloudflare Workers deployment adapter
- Drizzle ORM scaffolding for optional D1 integration
- ESLint for static checks

## Requirements

- Node.js 22.13.0 or newer
- npm
- Linux-compatible shell utilities for the included build scripts

## Install

```bash
npm ci
```

The Sites-compatible bounded installation command is also available:

```bash
npm run install:ci
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

To run the built application locally:

```bash
npm run start
```

## Validation

```bash
npm run lint
npm test
```

## Project structure

```text
app/                 Portfolio routes, content, metadata, and styles
build/               Sites/Vite build integration
db/                  Optional database scaffolding
drizzle/             Drizzle migration metadata
examples/            Optional D1 example source
public/               Public portfolio assets
public/images/        Project screenshots and image assets
scripts/              Installation, build, and artifact validation scripts
tests/                Rendered-output checks
worker/               Cloudflare Worker entry point
.openai/              ChatGPT Sites project configuration
.vinext/fonts/        Locally referenced Geist font assets
```

The main page implementation, project data, case-study content, SEO metadata, JSON-LD structured data, accessibility behavior, and interactive client-side functionality are contained in `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`.

## Deployment notes

The project is configured for the ChatGPT Sites/Vinext build pipeline and produces a Cloudflare Worker-compatible artifact. The `.openai/hosting.json` file records the Sites project configuration; it contains no deployment credential.

No secret credentials, private environment values, or confidential project implementation details are included in this repository. SalesBondhu appears only as the safe portfolio case-study content visible on the website.
