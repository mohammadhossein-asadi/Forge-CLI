# Contributing to Forge CLI

First off, thank you for considering a contribution — Forge CLI improves through contributors like you.

This document covers how to set up the project, our development workflow, and the standards every change is expected to meet.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Commands](#commands)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [License](#license)

---

## Code of Conduct

By participating in this project, you agree to keep discussions respectful and constructive. Be kind, be patient with newcomers, and assume good intent.

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|:-----|:--------|:------|
| [Node.js](https://nodejs.org) | >= 18.0.0 | Node 20+ recommended for development |
| [pnpm](https://pnpm.io) | >= 9.0.0 | The repo pins `packageManager` in `package.json` |
| [Git](https://git-scm.com) | recent | Any modern version |

> Tip: run `corepack enable` once and Node will provision the exact pnpm version the repo expects.

### Setup

```bash
# 1. Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Forge-CLI.git
cd Forge-CLI

# 2. Add the upstream remote (so you can keep your fork in sync):
git remote add upstream https://github.com/mohammadhossein-asadi/Forge-CLI.git

# 3. Install dependencies:
pnpm install

# 4. Build everything once so editors and tests resolve workspace packages:
pnpm build
```

### Verify your environment

```bash
node packages/forge/dist/cli.js doctor
```

---

## Project Structure

Forge CLI is a pnpm + Turborepo monorepo:

```
packages/
├── forge/         # Published CLI package — composes core + cli, owns the bin entry
├── cli/           # CLI layer — Commander commands, Ink components, themes, prompts
├── core/          # Core engine — DI container, kernel, config, events, plugins, fs
├── plugin-sdk/    # SDK for third-party plugin authors
└── shared/        # Shared types, constants, and utilities used by all packages
examples/
└── plugin-hello/  # Example plugin demonstrating the plugin SDK
```

**Which package do my changes belong in?**

- New/changed **commands, UI output, prompts, or themes** → `packages/cli`
- **Engines** (config resolution, events, plugin loading, filesystem, task running) → `packages/core`
- **Types or constants needed by multiple packages** → `packages/shared`
- Anything a plugin author consumes programmatically → `packages/plugin-sdk`

---

## Development Workflow

1. **Sync your fork** with upstream:
   ```bash
   git fetch upstream
   git checkout master
   git merge upstream/master
   ```
2. **Create a topic branch** from `master`:
   ```bash
   git checkout -b feat/my-feature        # or fix/my-bugfix, docs/my-docs
   ```
3. **Make your changes** in small, focused commits (see [Commit Guidelines](#commit-guidelines)).
4. **Run the full check suite locally** before opening a PR (see [Commands](#commands)).
5. **Push and open a Pull Request** against `mohammadhossein-asadi/Forge-CLI:master`.

Try the CLI end-to-end while developing:

```bash
pnpm build
node packages/forge/dist/cli.js --help
node packages/forge/dist/cli.js create my-test --template library
```

---

## Commands

All commands run from the repository root. Turborepo caches results, so they only re-run what changed.

| Command | What it does |
|:--------|:-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Watch mode across all packages |
| `pnpm build` | Build all packages (tsup) |
| `pnpm test` | Run the Vitest test suites |
| `pnpm lint` | Biome check (lint + format + import order) — must pass with **0 errors** |
| `pnpm lint:fix` | Auto-fix safe lint/format issues |
| `pnpm format` | Format all files with Biome |
| `pnpm typecheck` | TypeScript project checks (`tsc --noEmit`) — must pass with **0 errors** |
| `pnpm clean` | Remove build artifacts |

CI runs `lint`, `build` + `typecheck`, and `test` (on Node 18/20/22). Your PR must pass all of them — running the commands locally first is the fastest way to a green build.

---

## Coding Standards

The repository uses [Biome](https://biomejs.dev) for linting and formatting, configured in `biome.json`.

- **Formatting is enforced.** Do not hand-format or run other formatters; `pnpm format` (or `pnpm lint:fix`) produces the canonical style: 2-space indent, single quotes, no semicolons, 100-char lines, trailing commas.
- **TypeScript strictness is on** (`tsconfig.base.json`): `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`. Write code that satisfies it — do not weaken the config to make an error disappear.
- **Prefer `import type`** for type-only imports (Biome enforces `useImportType`).
- **No non-null assertions (`!`)** where a guard will do. Prefer explicit checks like `if (!entry) continue`.
- **Keep the module system ESM** (`"type": "module"` everywhere); use explicit `.js` extensions in relative imports.
- **No placeholder code, no commented-out blocks, no stray `console.log` debugging** in committed code.
- **Dependencies:** avoid adding new ones unless necessary; if you must, justify it in your PR and add them to the correct workspace package.

---

## Testing Guidelines

Tests live next to the code they cover (`*.test.ts`, e.g. `packages/core/src/events/event-bus.test.ts`) and run with Vitest.

- **New core-engine features need tests.** Bug fixes need a regression test that fails without the fix.
- CLI-layer changes should at minimum keep the suite green; UI-heavy changes may rely on typecheck/build, but add tests for any extractable logic.
- Run everything with:

```bash
pnpm test            # all packages
pnpm test:watch      # packages that define a watch script
```

- Packages without test files use `vitest run --passWithNoTests`; if you add the first test to such a package, remove the flag so regressions are caught.

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org) style — the same style already used in this repo's history:

```
<type>(<optional scope>): <short imperative summary>

<optional body explaining *why*, wrapped at ~72 chars>

<optional footer(s)>
```

**Common types**

| Type | Use for |
|:-----|:--------|
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes nor adds behavior |
| `test` | Adding or correcting tests |
| `chore` | Tooling, maintenance, metadata |

Examples:

```
feat(cli): add theme selection to forge config
fix(core): respect cwd argument in MemoryFileSystem.glob
docs: document plugin permissions in CONTRIBUTING
```

Small, logically-grouped commits beat one giant commit — reviewers (and `git bisect`) will thank you.

---

## Pull Request Process

1. Re-run the full suite one last time: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`.
2. Push your branch and open the PR against `master`.
3. Fill in the PR description: **what** changed, **why**, and **how you verified it**.
4. Ensure **CI is green** (Lint + Build & Typecheck + Test matrix). CI re-runs automatically when you push new commits.
5. Respond to review feedback with additional commits; a maintainer will squash-merge or ask you to tidy up before merge.

**PR checklist**

- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] New/changed behavior is covered by tests where practical
- [ ] Docs (README / CONTRIBUTING / command help text) updated if behavior changed
- [ ] Commits follow the Conventional Commits format

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/mohammadhossein-asadi/Forge-CLI/issues) and include:

1. **What happened** vs. **what you expected**.
2. **Exact steps to reproduce** (commands + flags, minimal reproduction preferred).
3. **Environment**: OS, Node version (`node -v`), Forge version (`forge --version`).
4. **Output/logs** relevant to the failure (please use code fences; do not paste secrets).

The built-in `forge doctor` output is often useful — include it (redact anything private).

---

## Suggesting Features

Feature suggestions are welcome — open an issue starting the title with `feat:` or "Feature request:" and describe:

- **The problem** you are trying to solve, not just the solution you imagined.
- **Who benefits** and in what workflow.
- Any **alternatives** you considered.

The maintainers weigh every suggestion against the project's quality bar: developer experience first, avoid feature bloat, keep modules replaceable.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) that covers this project.
