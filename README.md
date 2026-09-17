<div align="center">

# Forge CLI

### Next-Generation AI-Native Developer Platform

A pnpm monorepo powering an AI-native CLI and plugin ecosystem for building, configuring, analyzing, maintaining, and deploying software projects — built with Turborepo, Biome, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-0a0a0a?style=for-the-badge&labelColor=0a0a0a&color=22c55e)](LICENSE)
[![CI](https://github.com/mohammadhossein-asadi/Forge-CLI/actions/workflows/ci.yml/badge.svg?style=for-the-badge)](https://github.com/mohammadhossein-asadi/Forge-CLI/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo_2.3-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Biome](https://img.shields.io/badge/Biome_1.9-60A5FA?style=for-the-badge&logo=biome&logoColor=white)](https://biomejs.dev/)

</div>

---

## Overview

Forge CLI is a developer platform designed to be AI-native from the ground up. It provides a CLI tool, a core engine, a plugin SDK, and shared utilities — all orchestrated through a Turborepo monorepo with Biome for linting and formatting.

---

## Packages

| Package | Description |
|:--------|:------------|
| **cli** | Command-line interface for Forge operations |
| **core** | Core engine with project analysis and management logic |
| **forge** | Main Forge package — the AI-native build and deploy system |
| **plugin-sdk** | SDK for creating and integrating Forge plugins |
| **shared** | Shared types, utilities, and constants across packages |

---

## Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **Language** | TypeScript 5.7 |
| **Package Manager** | pnpm 9.15 (workspace) |
| **Monorepo** | Turborepo 2.3 |
| **Linting** | Biome 1.9 |
| **Module System** | ESNext (ESM) |
| **Node** | >= 18.0.0 |

---

## Project Structure

```
Forge-CLI/
├── packages/
│   ├── cli/                    # CLI entry point
│   ├── core/                   # Core engine
│   ├── forge/                  # Main Forge system
│   ├── plugin-sdk/             # Plugin development SDK
│   └── shared/                 # Shared utilities
├── examples/                   # Example projects
├── .forge/                     # Forge metadata
├── .turbo/                     # Turborepo cache
├── biome.json                  # Biome linter/formatter config
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace definition
├── tsconfig.base.json          # Shared TypeScript config
└── package.json
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0

### Installation

```bash
git clone https://github.com/mohammadhossein-asadi/Forge-CLI.git
cd Forge-CLI
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint & Format

```bash
pnpm lint          # Biome check
pnpm lint:fix      # Biome auto-fix
pnpm format        # Biome format
```

---

## Scripts

| Command | Description |
|:--------|:------------|
| `pnpm dev` | Run all packages in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome format |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |

---

## Key Architecture Decisions

### Turborepo for Monorepo Management
Turborepo provides intelligent caching, parallel execution, and dependency graph awareness — critical for a multi-package AI-native platform where packages frequently change together.

### Biome for Unified Toolchain
Biome replaces ESLint + Prettier + TypeScript ESLint with a single, fast Rust-based toolchain. Configuration lives in `biome.json` at the root.

### ES Modules Only
All packages use `"type": "module"` in package.json and ESNext module resolution. No CommonJS, no transpilation for Node.js >= 18.

### Plugin-First Design
The `plugin-sdk` package defines the contract for all Forge extensions. Core functionality is implemented as plugins, dogfooding the SDK.

### Shared TypeScript Config
`tsconfig.base.json` provides strict, consistent settings across all packages. Each package extends it with `references` for project references.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the project, our coding standards, and the pull request process.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Mohammadhossein Asadi** — Frontend & Full-Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-mohammadhossein--asadi-0a0a0a?style=flat-square&logo=github)](https://github.com/mohammadhossein-asadi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mohammadhossein--asadi-0a66c2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mohammadhossein-asadi)

</div>