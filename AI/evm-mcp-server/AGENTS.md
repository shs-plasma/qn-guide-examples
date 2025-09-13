# Repository Guidelines

## Project Structure & Module Organization
- `index.ts` – MCP server entry; wires tools, prompts, resources.
- `tools.ts` – EVM RPC tools (zod-validated handlers exposed to MCP).
- `prompts.ts` – Prebuilt prompt definitions and schemas.
- `resources.ts` – Read-only reference resources exposed via MCP.
- `clients.ts` – Viem public client factory with caching.
- `chains.ts` – Supported chains and QuickNode RPC URL builder.
- `build/` – Transpiled JavaScript (output of `tsc`).
- `tsconfig.json` – TypeScript configuration (strict, NodeNext).

## Build, Test, and Development Commands
- Install deps: `npm install`
- Build TypeScript: `npm run build` (outputs to `build/`)
- Run compiled server: `node build/index.js`
- Dev watch (optional): `npx tsc -w`
- Note: `npm start` uses `ts-node` but it is not pinned; prefer build + node, or install locally: `npm i -D ts-node`.

## Coding Style & Naming Conventions
- Language: TypeScript (ES2022, strict, NodeNext).
- Indentation: 2 spaces; include semicolons; single quotes or double consistently (project uses double).
- Naming: `camelCase` for variables/functions, `PascalCase` for types, `UPPER_SNAKE_CASE` for constants (e.g., `CHAINS`).
- Files: lowercase kebab or single word (e.g., `tools.ts`, `resources.ts`).
- Validation: prefer Zod schemas; reuse `ChainId`, `CHAINS` utilities.
- Return plain JSON-serializable objects from tool handlers; avoid hidden side effects.

## Testing Guidelines
- No test framework is configured yet. If adding tests, prefer Vitest.
- Place tests as `*.test.ts` beside sources or under `__tests__/`.
- Focus on: schema validation, tool handler success/failure paths, and client configuration.
- Keep tests hermetic; mock RPC where possible.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits (e.g., `feat: add eth_getLogs tool`, `fix: handle invalid address`).
- PRs must include: intent summary, linked issue (if any), behavior changes, run/build steps, and screenshots/logs for user-visible changes.
- Update `README.md` and code comments when public APIs, prompts, or chains change.

## Security & Configuration Tips
- Required env vars: `QN_ENDPOINT_NAME`, `QN_TOKEN_ID`. Do not commit secrets.
- Local run via Claude Desktop: set env in `claude_desktop_config.json` and point to `build/index.js`.
- Default network is Plasma mainnet (`plasma`). Extend `CHAINS` carefully and document additions.
