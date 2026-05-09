# my-turborepo

基于 [Turborepo](https://turborepo.com) + [pnpm](https://pnpm.io) 的 Monorepo。

## 工具链

- **pnpm 10.23.0**（通过根 `package.json` 的 `packageManager` 字段固定，由 Corepack 强制使用此精确版本）
- **Node ≥ 20**

## 工作区

```
apps/
  web    — Next.js 16 应用，端口 3000
  docs   — Next.js 16 应用,  端口 3001
packages/
  ui                  (@repo/ui)               — 共享 React 组件库（源码导出，无构建）
  math                (@repo/math)             — 工具库（tsup 构建，type:module）
  eslint-config       (@repo/eslint-config)    — flat-config 预设
  typescript-config   (@repo/typescript-config) — tsconfig 预设
```

## 常用命令

在仓库根目录执行：

```sh
pnpm install                  # 安装依赖
pnpm dev                      # 启动所有 app + 库 watcher（常驻进程）
pnpm build                    # 构建全部
pnpm lint                     # ESLint 检查（--max-warnings 0）
pnpm check-types              # TypeScript 类型检查
pnpm format                   # Prettier 代码格式化
```

针对单个 workspace：

```sh
pnpm --filter web dev                # 仅启动 apps/web
pnpm --filter @repo/math build       # 仅构建某个共享包
turbo run build --filter=docs        # turbo 层级过滤（仍会构建传递依赖）
```

## 首次启动

```sh
pnpm install
pnpm --filter @repo/math build   # 必须先建一次 dist/，否则 dev 启动时 Next.js 找不到模块
pnpm dev
```

之后日常开发只需 `pnpm dev` —— `@repo/math` 的 `tsup --watch` 会持续重建。

## 进一步阅读

- 架构细节、共享代码的两种消费模式、踩过的坑：[CLAUDE.md](./CLAUDE.md)
- Turborepo 文档：https://turborepo.com/docs
