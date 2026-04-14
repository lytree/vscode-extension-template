# VSCode 插件模板（Node.js 22 + pnpm）

实现了 **WebviewPanel** 和 **WebviewViewProvider** 两个页面，且**完全基于 Vite 多入口编译**（不使用 esbuild）。

## 目标实现

- Panel 与 View 使用不同入口：
  - `src/panel/main.ts`
  - `src/view/main.ts`
- Panel 与 View 使用**相同组件库**：
  - `src/shared/components/*`
  - `src/shared/hooks/*`
- 通过 Vite manifest 在运行时解析各入口编译产物路径。

## 构建命令

```bash
pnpm run compile:web   # vite build
pnpm run compile       # compile:ext + compile:web
```

## 目录结构

```txt
extension/
  panels/
  views/
  webview/
src/
  panel/
  view/
  shared/
vite.config.ts
```
