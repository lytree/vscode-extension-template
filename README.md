# VSCode Extension Template (TypeScript)

这是一个可直接开始开发的 VSCode 插件模板。

## 功能

- TypeScript 开发体验（严格模式）
- 命令注册示例：`Template: Hello World`
- 基础 ESLint 配置
- 打包忽略配置（`.vscodeignore`）
# Vite + React + TypeScript + UnoCSS + shadcn/ui 模板


## 快速开始

```bash
pnpm install
pnpm run compile
```

然后在 VSCode 中：

1. 打开该项目
2. 按 `F5` 启动 Extension Development Host
3. 在命令面板执行 `Template: Hello World`

## 常用脚本

- `pnpm run compile`：编译到 `out/`
- `pnpm run watch`：监听编译
- `pnpm run lint`：运行 ESLint
- `pnpm run package`：打包前编译

## 模板结构

```txt
src/
  extension.ts
  test/runTest.ts
npm run dev
```

## 可用脚本

- `pnpm run dev`：本地开发
- `pnpm run build`：类型检查 + 生产构建
- `pnpm run preview`：预览构建结果
- `pnpm run typecheck`：TypeScript 类型检查

## 目录结构

```txt
src/
  components/ui/button.tsx
  lib/utils.ts
  App.tsx
  main.tsx
  styles.css
```
