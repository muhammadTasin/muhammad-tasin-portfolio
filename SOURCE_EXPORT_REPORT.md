# Current Portfolio Source Export Report

## Export identity

- Portfolio owner: Md. Tasfiq Tasin
- Export purpose: Source-controlled backup of the current existing portfolio Site
- Prepared source files: 54
- Additional export report: `SOURCE_EXPORT_REPORT.md`
- Site design or content changes during ZIP creation: None
- Live Site publication or modification: None

## Complete top-level contents

```text
.gitignore
.npmrc
.openai/
.vinext/
README.md
SOURCE_EXPORT_REPORT.md
app/
build/
db/
drizzle/
drizzle.config.ts
eslint.config.mjs
examples/
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public/
scripts/
tests/
tsconfig.json
vite.config.ts
worker/
```

## Framework and package information

- Application model: React application using Next.js source conventions
- React: 19.2.6
- React DOM: 19.2.6
- Next.js: 16.2.6
- Vinext: 0.0.50
- Vite: 8.0.13
- TypeScript: 5.9.3
- Cloudflare Vite plugin: 1.37.1
- Wrangler: 4.92.0
- Drizzle ORM: 0.45.2
- ESLint: 9.39.4
- Required Node.js version: 22.13.0 or newer
- Package manifest: `package.json`
- Lockfile: `package-lock.json`

## Commands

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Create the production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Validation results

- Lint result: Passed with no ESLint errors.
- Production-build result: Passed. Vinext completed all build stages and the Sites artifact validator confirmed an ESM Worker `default.fetch` export and hosting manifest.
- Secret-scan result: Passed. No API keys, access tokens, passwords, private environment values, database credentials, private repository URLs, private SalesBondhu implementation details, private API endpoints, client/dealer/employee data, or temporary credentials were found in the exported source.
- Asset verification: Passed. Current project screenshots, local font assets, favicon, Open Graph PNG/SVG assets, resume text, metadata, and structured data are included.
- Exclusions confirmed: `node_modules`, `.next`, `dist`, `.wrangler`, `.sites-runtime`, logs, editor files, environment files, dependency caches, and temporary files are not included.

## Asset locations

- Project screenshots and image assets: `public/images/`
- Favicon: `public/favicon.svg`
- Open Graph assets: `public/og-card.png` and `public/og-card.svg`
- Local font assets and references: `.vinext/fonts/`

No confidential credentials or private project implementation details are included in this export. SalesBondhu appears only through the safe portfolio content already present in the current Site.
