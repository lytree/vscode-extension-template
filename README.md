# VSCode 插件模板（Node.js 22 + pnpm）

这是一个适用于 **Node.js 22 + pnpm** 的 VSCode 插件模板，并内置了 Webview 页面示例。

## 设计约定

- `src/`：插件业务逻辑（命令、服务、面板等）
- `webview/`：Webview 页面资源（HTML/CSS/JS）

## 已内置能力

- 命令：`Template: Open Webview`
- Webview 与扩展端双向通信示例
- TypeScript 严格模式
- ESLint 基础配置

## 快速开始

```bash
pnpm install
pnpm run compile
```

在 VSCode 中按 `F5` 启动 Extension Development Host，执行 `Template: Open Webview`。

## 目录结构

```txt
src/
  extension.ts
  commands/registerOpenWebviewCommand.ts
  panels/TemplatePanel.ts
  services/messageService.ts
  test/runTest.ts
webview/
  index.html
  main.js
  style.css
```
