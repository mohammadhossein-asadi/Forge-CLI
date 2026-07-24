import type { ProjectTemplate } from './types.js'

export const TEMPLATES: ProjectTemplate[] = [
  // ─── React ───────────────────────────────────────────────────
  {
    id: 'react',
    name: 'React',
    description: 'React with TypeScript and Vite',
    framework: 'react',
    language: 'typescript',
    category: 'frontend',
    tags: ['react', 'vite', 'typescript', 'frontend'],
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      lint: 'eslint src --ext ts,tsx',
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.3.0',
      typescript: '^5.7.0',
      vite: '^6.0.0',
    },
    files: [
      { path: 'src/main.tsx', content: `import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.tsx'\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n` },
      { path: 'src/App.tsx', content: `export default function App() {\n  return (\n    <div>\n      <h1>Hello from Forge</h1>\n    </div>\n  )\n}\n` },
      { path: 'src/App.css', content: `#root {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n` },
      { path: 'index.html', content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>{{name}}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n` },
      { path: 'vite.config.ts', content: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n` },
      { path: 'tsconfig.json', content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "react-jsx",\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["src"]\n}\n` },
    ],
  },

  // ─── Next.js ─────────────────────────────────────────────────
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Next.js with App Router and TypeScript',
    framework: 'nextjs',
    language: 'typescript',
    category: 'fullstack',
    tags: ['nextjs', 'react', 'typescript', 'fullstack', 'ssr'],
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '^15.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      typescript: '^5.7.0',
    },
    files: [
      { path: 'src/app/layout.tsx', content: `import type { Metadata } from 'next'\n\nexport const metadata: Metadata = {\n  title: '{{name}}',\n  description: 'Created with Forge CLI',\n}\n\nexport default function RootLayout({\n  children,\n}: Readonly<{\n  children: React.ReactNode\n}>) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}\n` },
      { path: 'src/app/page.tsx', content: `export default function Home() {\n  return (\n    <main>\n      <h1>Hello from Forge</h1>\n    </main>\n  )\n}\n` },
      { path: 'next.config.ts', content: `import type { NextConfig } from 'next'\n\nconst nextConfig: NextConfig = {}\n\nexport default nextConfig\n` },
      { path: 'tsconfig.json', content: `{\n  "compilerOptions": {\n    "target": "ES2017",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [{ "name": "next" }],\n    "paths": { "@/*": ["./src/*"] }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}\n` },
    ],
  },

  // ─── Vue ─────────────────────────────────────────────────────
  {
    id: 'vue',
    name: 'Vue',
    description: 'Vue 3 with TypeScript and Vite',
    framework: 'vue',
    language: 'typescript',
    category: 'frontend',
    tags: ['vue', 'vite', 'typescript', 'frontend'],
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.0',
      typescript: '^5.7.0',
      vite: '^6.0.0',
      'vue-tsc': '^2.2.0',
    },
    files: [
      { path: 'src/main.ts', content: `import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')\n` },
      { path: 'src/App.vue', content: `<template>\n  <div>\n    <h1>Hello from Forge</h1>\n  </div>\n</template>\n` },
      { path: 'index.html', content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>{{name}}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>\n` },
      { path: 'vite.config.ts', content: `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()],\n})\n` },
      { path: 'tsconfig.json', content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "module": "ESNext",\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "skipLibCheck": true,\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "preserve",\n    "strict": true\n  },\n  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]\n}\n` },
    ],
  },

  // ─── Node.js ─────────────────────────────────────────────────
  {
    id: 'node',
    name: 'Node.js',
    description: 'Node.js CLI with TypeScript',
    framework: 'node',
    language: 'typescript',
    category: 'cli',
    tags: ['node', 'cli', 'typescript', 'backend'],
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev: 'tsx src/index.ts',
      test: 'vitest run',
      lint: 'eslint src --ext ts',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      tsx: '^4.19.0',
      typescript: '^5.7.0',
      vitest: '^2.1.0',
    },
    files: [
      { path: 'src/index.ts', content: `console.log('Hello from Forge')\n` },
      { path: 'tsconfig.json', content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["src"]\n}\n` },
    ],
  },

  // ─── Library ─────────────────────────────────────────────────
  {
    id: 'library',
    name: 'TypeScript Library',
    description: 'TypeScript library with tsup',
    framework: 'library',
    language: 'typescript',
    category: 'library',
    tags: ['library', 'typescript', 'npm', 'package'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      test: 'vitest run',
      lint: 'eslint src --ext ts',
      prepublishOnly: 'npm run build',
    },
    devDependencies: {
      tsup: '^8.3.0',
      typescript: '^5.7.0',
      vitest: '^2.1.0',
    },
    files: [
      { path: 'src/index.ts', content: `export function greet(name: string): string {\n  return \`Hello, \${name}!\`\n}\n` },
      { path: 'tsup.config.ts', content: `import { defineConfig } from 'tsup'\n\nexport default defineConfig({\n  entry: ['src/index.ts'],\n  format: ['cjs', 'esm'],\n  dts: true,\n  clean: true,\n})\n` },
      { path: 'tsconfig.json', content: `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "declaration": true,\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true\n  },\n  "include": ["src"]\n}\n` },
    ],
  },

  // ─── Empty ───────────────────────────────────────────────────
  {
    id: 'empty',
    name: 'Empty',
    description: 'Empty project with minimal setup',
    framework: 'vanilla',
    language: 'typescript',
    category: 'frontend',
    tags: ['minimal', 'vanilla', 'starter'],
    scripts: {
      dev: 'echo "No dev script configured"',
      build: 'echo "No build script configured"',
    },
    files: [
      { path: 'src/index.ts', content: `console.log('Hello from Forge')\n` },
    ],
  },
]

export function getTemplate(id: string): ProjectTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export function searchTemplates(query: string): ProjectTemplate[] {
  const lower = query.toLowerCase()
  return TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.includes(lower)),
  )
}
