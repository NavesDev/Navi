# Repository Guidelines

## Project Structure & Module Organization

Navi is a pnpm workspace monorepo. `apps/mobile` contains the Expo React Native app; note its local `AGENTS.md` requires checking Expo v56 docs before mobile code changes. `apps/web` contains the React/Vite dashboard. `services/api` is the Rails 8.1 API, with models, controllers, migrations, fixtures, and tests under the standard Rails directories. Shared TypeScript lives in `packages/types` and `packages/shared`; shared tooling config lives in `packages/config`. Documentation is in `docs`, and infrastructure notes/configuration are in `infra/docker` and `infra/google-cloud`.

## Build, Test, and Development Commands

Install dependencies from the root with `pnpm install`.

- `pnpm dev:mobile`: starts Expo Metro for the mobile app.
- `pnpm dev:web`: starts the Vite dashboard on port 5173.
- `pnpm dev:api`: starts Rails on port 3000.
- `pnpm build:web`: typechecks and builds the web app.
- `pnpm typecheck`: runs TypeScript checks across workspace packages.
- `pnpm lint`: runs package lint scripts, currently focused on the web app.
- `pnpm --filter @navi/api db:setup`: prepares the Rails database.
- `pnpm --filter @navi/api test`: runs the Rails test suite.

## Coding Style & Naming Conventions

Use TypeScript for frontend and shared packages. Follow the existing 2-space indentation style, single quotes, and extensionless local imports where already used. React components use PascalCase filenames, such as `AuthForm.tsx`; hooks use `useX.ts`. Shared exports should be centralized through `src/index.ts`. Format supported files with `pnpm format`; web linting uses ESLint flat config in `apps/web/eslint.config.js`. Rails code follows standard Rails naming: snake_case files, CamelCase classes, plural REST controllers, and timestamped migrations.

## Testing Guidelines

Rails uses Minitest. Place model tests in `services/api/test/models`, integration tests in `services/api/test/integration`, and fixtures in `services/api/test/fixtures`. Name tests after the behavior or endpoint being covered, for example `expenses_test.rb` or `api/v1/auth_test.rb`. Run `pnpm --filter @navi/api test` before API changes, and `pnpm typecheck` before TypeScript changes.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages: `feat(api): ...`, `fix(mobile): ...`, `db: ...`. Keep subjects imperative and scoped when useful. Pull requests should describe the change, list verification commands run, link related issues, and include screenshots or screen recordings for UI changes. Mention database migrations, environment variables, or deployment impacts explicitly.

## Security & Configuration Tips

Do not commit secrets or local `.env` files. Rails reads `DATABASE_URL`; local Docker database setup is documented in `infra/docker`. Keep API credentials, Neon URLs, and mobile/web environment values out of source control.
