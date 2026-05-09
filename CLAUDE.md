# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 工具链

- 包管理器：**pnpm 10.23.0**（在根 `package.json` 的 `packageManager` 字段中固定 —— Corepack 会强制使用此精确版本）。
- Node：`>=20`。
- Workspace 在 `pnpm-workspace.yaml` 中声明（`apps/**`、`packages/**`）。

## 常用命令

在仓库根目录执行：

```sh
pnpm install                  # 安装依赖并建立 workspace 软链
pnpm dev                      # turbo run dev（所有 app + 库 watcher，常驻进程）
pnpm build                    # turbo run build（带 ^build 依赖链）
pnpm lint                     # turbo run lint，--max-warnings 0
pnpm check-types              # turbo run check-types
pnpm format                   # prettier --write "**/*.{ts,tsx,md}"
```

针对单个 workspace：

```sh
pnpm --filter web dev                 # 仅运行 apps/web 的脚本
pnpm --filter @repo/math build        # 仅构建某个共享包
turbo run build --filter=docs         # turbo 层级的过滤（仍会构建传递依赖）
```

在 `@repo/ui` 中生成新组件（使用 Turbo gen）：

```sh
pnpm --filter @repo/ui generate:component
```

## 架构

### Workspace 布局

- `apps/web` —— Next.js 16 应用，端口 **3000**（`apps/web/package.json:7`）。
- `apps/docs` —— Next.js 16 应用，端口 **3001**（`apps/docs/package.json:7`）。
- `packages/ui` (`@repo/ui`) —— 共享 React 组件库。
- `packages/math` (`@repo/math`) —— 工具库（同时也是 TypeScript 练习场，见 `src/index.ts`）。
- `packages/eslint-config` (`@repo/eslint-config`) —— flat-config 预设，通过子路径导出：`./base`、`./next-js`、`./react-internal`。
- `packages/typescript-config` (`@repo/typescript-config`) —— `base.json`、`nextjs.json`、`react-library.json`。

所有共享包都使用 `@repo/*` 命名空间，并通过 `workspace:*` 互相引用。

### 共享代码的两种消费模式（重要）

本仓库刻意使用了**两种不同的模式**来共享代码，二者不可互换：

1. **源码导出模式（无构建步骤）** —— `@repo/ui` 使用：
   ```json
   "exports": { "./*": "./src/*.tsx" }
   ```
   消费方导入形如 `@repo/ui/button`。Next.js / Turbopack 直接编译 `.tsx`。包内没有 `dist/`，也没有 build 脚本 —— `packages/ui/src/` 中的修改立即生效。`react` / `react-dom` 声明在 `peerDependencies` 中，避免下游 app 出现重复 React 实例。

2. **构建产物模式** —— `@repo/math` 使用：
   - `"type": "module"`，通过 `exports` 字段同时声明 `import`（ESM `dist/index.js`）/ `require`（CJS `dist/index.cjs`）/ `types`（`dist/index.d.ts`）。
   - `dev` 脚本是 `tsup ... --watch`（**不带 `--clean`**，避免每次重建清空 dist 影响下游 Next.js 解析）；`build` 才是 `tsup ... --clean`。
   - **首次启动 `pnpm dev` 之前必须先单独构建一次 `@repo/math`**，否则下游 Next.js 应用可能在 watcher 还没产出 `dist/` 之前就尝试解析 `@repo/math`：
     ```sh
     pnpm --filter @repo/math build
     ```
   - 包声明了 `"sideEffects": false`，让消费端 bundler 可以做 tree-shaking。

新增共享包时，根据下游应用的 bundler 是否能直接编译源码来选择模式：UI / React 组件走模式 1；需要预编译的 Node 风格库、`type: module` ESM 库走模式 2。

### Turbo 任务图（`turbo.json`）

- `build` —— `dependsOn: ["^build"]`，输出 `.next/**` 和 `dist/**`，`inputs` 包含 `.env*`。
- `dev` —— `persistent: true`，`cache: false`。所有 `dev` 脚本并行运行：Next.js dev server + `@repo/math` 的 tsup watcher。
- `lint`、`check-types` —— 都通过 `^lint` / `^check-types` 向依赖图传递。
- `globalEnv: ["NODE_ENV"]`、`globalDependencies: [".env"]`。

### ESLint

Flat config（ESLint 9）。每个 app/package 都有自己的 `eslint.config.{js,mjs}`，从 `@repo/eslint-config` 引入预设：

- `@repo/eslint-config/base` —— JS recommended + TS-ESLint + Prettier + `eslint-plugin-turbo`（`turbo/no-undeclared-env-vars`）。使用 `eslint-plugin-only-warn`，所以**所有规则在规则层都是 warning** —— 严重性由 CLI 的 `--max-warnings 0` 强制为 error。
- `@repo/eslint-config/next-js` —— 在 base 之上加 React + React Hooks + `@next/eslint-plugin-next`（recommended + core-web-vitals）。
- `@repo/eslint-config/react-internal` —— 用于非 Next 的 React 库。

### TypeScript

`@repo/typescript-config/base.json` 启用了 strict 模式，目标 ES2022，`module: NodeNext`，`noUncheckedIndexedAccess: true`。各 app 的 `tsconfig.json` 应继承对应预设（`base`、`nextjs` 或 `react-library`）。

各 app 的 `check-types` 执行 `next typegen && tsc --noEmit` —— Next 路由类型必须在 `tsc` 之前先生成。

## 本仓库踩过的坑

- 给某个包加了 `workspace:*` 依赖之后，必须运行 `pnpm install` 才能建立软链（如 `apps/web/node_modules/@repo/...`）。报错形式是通用的 `Module not found: Can't resolve '@repo/...'`。
- 对 `@repo/math` 而言，这个解析错误也可能意味着 `dist/` 还没生成 —— 先单独 build 一次即可。
- 两个 Next.js 应用都使用固定端口（3000、3001），不会自动 fallback；冲突的进程需要先 kill 掉再跑 `pnpm dev`。
