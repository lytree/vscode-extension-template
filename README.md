# VSCode 插件模板（Node.js 22 + pnpm）

模板包含两种 Webview 形态：

- `WebviewPanel`
- `WebviewViewProvider`

两者共用同一套页面组件，仅在入口文件进行区分。

## 目录约定

- `extension/`：VSCode 相关逻辑（commands / panels / views）
- `src/`：Web 页面资源
  - `shared/`：共享组件与样式
  - `entries/`：不同入口（panel / view）

## 命令与视图

- `Template: Hello World`
- `Template: Open Webview Panel`
- Activity Bar 视图容器 `Template` 下提供 `Template View`

## 目录结构

```txt
extension/
  commands/
  panels/
  views/
  webview/
src/
  shared/
  entries/
```
