# VSCode 插件模板（Node.js 22 + pnpm）

这是一个适用于 **Node.js 22 + pnpm** 的 VSCode 插件模板。

## 目录约定

- `extension/`：存放所有 VSCode 相关逻辑（命令、服务、测试）

## 已内置能力

- 命令：`Template: Hello World`
- TypeScript 严格模式
- ESLint 基础配置

## 快速开始

```bash
pnpm install
pnpm run compile
```

在 VSCode 中按 `F5` 启动 Extension Development Host，执行 `Template: Hello World`。

## 目录结构

```txt
extension/
  extension.ts
  commands/registerHelloCommand.ts
  test/runTest.ts
```

## VSCode 调试配置

已内置调试配置（见 `.vscode/launch.json` 与 `.vscode/tasks.json`）：

- `Run Extension (Watch)`：启动前执行 `pnpm run watch`，适合日常开发。
- `Run Extension (Compile Once)`：启动前仅编译一次，适合快速验证。
