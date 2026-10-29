<div align="center">

# Forge CLI

### پلتفرم توسعه‌ی نسل جدید و هوشمند-به‌هوش

یک پایarchar monorepo مبتنی بر pnpm که اکوسیستم CLI و پلاگین‌های هوشمندزاده را برای ساخت، پیکربندی، تحلیل، نگهداری و استقرار پروژه‌های نرم‌افزاری پیشران می‌کند — با Turborepo، Biome و TypeScript ساخته شده.

[![License: MIT](https://img.shields.io/badge/License-MIT-0a0a0a?style=for-the-badge&labelColor=0a0a0a&color=22c55e)](LICENSE)
[![CI](https://github.com/mohammadhossein-asadi/Forge-CLI/actions/workflows/ci.yml/badge.svg?style=for-the-badge)](https://github.com/mohammadhossein-asadi/Forge-CLI/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo_2.3-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Biome](https://img.shields.io/badge/Biome_1.9-60A5FA?style=for-the-badge&logo=biome&logoColor=white)](https://biomejs.dev/)

</div>

---

## نمای کلی

Forge CLI پلتفرمی برای توسعه‌کاران است که از پایه به‌صورت هوشمند-زاده طراحی شده. ابزار خط فرمان CLI، موتور هسته، SDK پلاگین، و ابزارهای مشترک را فراهم می‌کند — همه از طریق پایarchar مونورپو Turborepo با Biome برای لینتینگ و فرمت‌دهی دسته‌بندی شده‌اند.

---

## بسته‌ها

| بسته | توضیح |
|:--------|:------------|
| **cli** | رابط خط فرمان برای عملیات‌های Forge |
| **core** | موتور هسته با منطق تحلیل و مدیریت پروژه |
| **forge** | بسته‌ی اصلی Forge — سیستم ساخت و استقرار هوشمندزاده |
| **plugin-sdk** | SDK برای ساخت و یکپارچه کردن پلاگین‌های Forge |
| **shared** | انواع، ابزارها و ثوابت مشترک بین بسته‌ها |

---

## پشته فناوری

| لایه | فناوری‌ها |
|:------|:-------------|
| **زبان** | TypeScript 5.7 |
| **مدیر بسته‌ها** | pnpm 9.15 (workspace) |
| **پایتarchar مونورپو** | Turborepo 2.3 |
| **لینتینگ** | Biome 1.9 |
| **سیستم مولفه‌ها** | ESNext (ESM) |
| **Node** | >= 18.0.0 |

---

## ساختار پروژه

```
Forge-CLI/
├── packages/
│   ├── cli/                    # نقطه ورود CLI
│   ├── core/                   # موتور هسته
│   ├── forge/                  # سیستم اصلی Forge
│   ├── plugin-sdk/             # SDK توسعه پلاگین
│   └── shared/                 # ابزارهای مشترک
├── examples/                   # پروژه‌های نمونه
├── .forge/                     # فراداده Forge
├── .turbo/                     # کش Turborepo
├── biome.json                  # پیکربندی لینتر/فرمت‌دهی Biome
├── turbo.json                  # پیکربندی پای‌بی‌اسه Turborepo
├── pnpm-workspace.yaml         # تعریف workspace
├── tsconfig.base.json          # پیکربندی Shared TypeScript
└── package.json
```

---

## تصاویرک

همه از خروجی workspace مشخص‌شده مستندی‌شده(deadline) ثبت‌شده (بازتولید با `scripts/make-cli-screenshots.py` در مخزن آرایهه):

| `pnpm install` | `pnpm build` (Turborepo) |
|:---:|:---:|
| ![راه‌اندازی workspace](docs/screenshot-1.png) | ![بیلد Turborepo](docs/screenshot-2.png) |
| **`pnpm lint` / typecheck** | **`pnpm dev`** |
| ![لینت و تایپ‌چک](docs/screenshot-3.png) | ![حالت توسعه](docs/screenshot-4.png) |

---

## شروع سریع

### پیش‌نیازها

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0

### نصب

```bash
git clone https://github.com/mohammadhossein-asadi/Forge-CLI.git
cd Forge-CLI
pnpm install
```

### توسعه

```bash
pnpm dev
```

### بیلد

```bash
pnpm build
```

### لینت و فرمت

```bash
pnpm lint          # بررسی Biome
pnpm lint:fix      # اصلاح خودکار Biome
pnpm format        # فرمت‌دهی Biome
```

---

## اسکریپت‌ها

| دستور | توضیح |
|:--------|:------------|
| `pnpm dev` | اجرای همه بسته‌ها در حالت Estall |
| `pnpm build` | بیلد همه بسته‌ها |
| `pnpm test` | اجرای همه تست‌ها |
| `pnpm lint` | بررسی Biome |
| `pnpm lint:fix` | اصلاح خودکار Biome |
| `pnpm format` | فرمت‌دهی Biome |
| `pnpm typecheck` | بررسی تایپ TypeScript |
| `pnpm clean` | پاک‌سازی همه آریتfacts بیلد |

---

## تصمیمات کلیدی معماری

### Turborepo برای مدیریت مونورپو
Turborepo کش هوشمند، اجرای موازی و آگاهی از نمودار وابستگی را فراهم می‌کند — حیاتی برای پلتفرم‌های هوشمندزاده چند-بسته‌ای که بسته‌ها به‌طور مکرر هم‌زمان تغییر می‌کنند.

### Biome برای زنجیره‌ی ابزار یکپارچه
Biome ESLint + Prettier + TypeScript ESLint را با یک زنجیره‌ی ابزار Rustی سریع و یک نمونه جایگزینی می‌کند. پیکربندی در `biome.json` در ریشه زندگی می‌کند.

### فقط مدول‌های ES
همه بسته‌ها `\"type\": \"module\"` را در package.json و حل‌کرون مدول‌های ESNext استفاده می‌کنند. بدون CommonJS، بدون ترانسپیل برای Node.js >= 18.

### طراحی اول‌پلاگین
بسته‌ی `plugin-sdk` قرارداد را برای همه扩展‌های Forge تعریف می‌کند. عملکرد هسته به‌صورت پلاگین‌ها پیاده‌سازی می‌شود، به‌کارگیری درون‌توان(SDK خود را).

### پیکربندی Shared TypeScript
`tsconfig.base.json` تنظیمات صریح و یکسان را بین همه بسته‌ها فراهم می‌کند. هر بسته با `references` برای مراجعات پروژه آن را گسترش می‌دهد.

---

## مشارکت

مشارکت‌ها خوش‌آمدند! برای راه‌اندازی پروژه، استانداردهای کدنویسی و فرآیند پول‌رکویس، [CONTRIBUTING.md](CONTRIBUTING.md) را ببینید.

---

## مجوز

این پروژه تحت [مجوز MIT](LICENSE) منتشر شده است.

---

<div align="center">

**Mohammadhossein Asadi** — مهندس فرانت‌اند و فرانت‌به‌کل

[![GitHub](https://img.shields.io/badge/GitHub-mohammadhossein--asadi-0a0a0a?style=flat-square&logo=github)](https://github.com/mohammadhossein-asadi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mohammadhossein--asadi-0a66c2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mohammadhossein-asadi)

</div>
