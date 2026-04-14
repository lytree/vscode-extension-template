# VSCode 插件模板（Node.js 22 + pnpm）

实现了 **WebviewPanel** 和 **WebviewViewProvider** 双形态页面，并满足：

- Panel 与 View 使用**不同编译入口**
- Panel 与 View 输出到**不同编译路径**
- 仅共享组件库 / hooks，不共享页面

## 编译产物

- Panel: `media/panel/index.js` + `media/panel/index.css`
- View: `media/view/index.js` + `media/view/index.css`

## 源码结构

```txt
extension/
  panels/
  views/
  webview/
src/
  panel/      # Panel 页面与入口
  view/       # View 页面与入口
  shared/     # 共享组件与 hooks
scripts/
  build-web.mjs
```
