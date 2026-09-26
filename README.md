# The AI Fundi

Chris Conley’s website, applications, and practical AI portfolio.

## Development

Use Node.js 22 and the pnpm version pinned in package.json. Run `corepack pnpm install --frozen-lockfile`, then `pnpm dev`.

## Verify and build

Run `pnpm typecheck` and `pnpm build`.

## Deployment

This repository is connected to the existing Vercel project `ai-fundi-lab`. Changes on a review branch produce previews. The production branch is `master`; verified changes merged there deploy to the existing domain.

The approved visual source was Sites commit e94ff341fdf3cf1ee05a854685e4ba352905f156. The Vercel distribution uses standard Next.js; the visual components and motion are retained. Existing public links and SEO assets are preserved.
