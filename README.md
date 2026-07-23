<div align="center">

# Forge CLI

### Next-Generation AI-Native Developer Platform

A pnpm monorepo powering an AI-native CLI and plugin ecosystem for building, configuring, analyzing, maintaining, and deploying software projects — built with Turborepo, Biome, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-0a0a0a?style=for-the-badge&labelColor=0a0a0a&color=22c55e)](LICENSE)

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

## Author

**Mohammadhossein Asadi** — Frontend & Full-Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-mohammadhossein--asadi-0a0a0a?style=flat-square&logo=github)](https://github.com/mohammadhossein-asadi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mohammadhossein--asadi-0a66c2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mohammadhossein-asadi)

---

## License

This project is licensed under the [MIT License](LICENSE).
