# VSCode 插件模板 AGENTS 文档

## 项目概览

VSCode 插件模板是一个基于 TypeScript 的 VS Code 扩展开发模板，使用 Node.js 22 + pnpm 构建，集成了 WebviewPanel 和 WebviewViewProvider 功能。

- **项目名称**: vscode-extension-template
- **描述**: TypeScript VS Code extension template (Node.js 22 + pnpm) with WebviewPanel and WebviewViewProvider.

## 目录结构

```
vscode-extension-template/
├── .vscode/           # VS Code 配置文件
├── extension/         # 扩展核心代码
│   ├── commands/      # 命令注册
│   ├── panels/        # 面板相关
│   ├── services/      # 服务
│   ├── test/          # 测试
│   ├── views/         # 视图相关
│   ├── webview/       # Webview 相关
│   └── extension.ts   # 扩展入口
├── resources/         # 资源文件
├── src/               # 前端代码
│   ├── components/    # 组件
│   ├── panel/         # 面板前端
│   ├── view/          # 视图前端
│   └── styles.css     # 样式
├── package.json       # 项目配置
└── vite.config.ts     # Vite 配置
```

## 核心功能

### 1. 命令系统

- **Hello World 命令**: 显示一个信息提示
- **Open Webview Panel 命令**: 打开一个 Webview 面板
- **Webview View**: 在侧边栏显示一个 Webview 视图

### 2. Webview 系统

- **WebviewPanel**: 可独立打开的 Webview 面板
- **WebviewViewProvider**: 集成在侧边栏的 Webview 视图
- **Vite 多入口编译**: 为 Panel 和 View 提供不同的编译入口

### 3. 技术栈

- **后端**: TypeScript, Node.js 22
- **前端**: React 19, TypeScript, Tailwind CSS, Vite,shadcn/ui
- **包管理**: pnpm
- **构建工具**: TypeScript Compiler, Vite

## 主要文件说明

### 扩展入口

- **extension/extension.ts**: 扩展的主入口，注册命令和视图提供者

### 命令注册

- **extension/commands/registerHelloCommand.ts**: 注册 Hello World 命令
- **extension/commands/registerOpenPanelCommand.ts**: 注册打开面板命令
- **extension/commands/registerOpenWebviewCommand.ts**: 注册打开 Webview 命令

### 视图相关

- **extension/views/TemplateViewProvider.ts**: 侧边栏视图提供者
- **extension/panels/TemplatePanel.ts**: 面板视图实现

### 前端代码

- **src/panel/main.tsx**: 面板前端入口
- **src/view/main.tsx**: 视图前端入口
- **src/components/**: 共享组件

## 构建与开发

### 构建命令

```bash
pnpm run clean           # 清理构建产物
pnpm run compile:web     # 编译前端代码（Vite）
pnpm run compile:ext     # 编译扩展代码（TypeScript）
pnpm run compile         # 编译所有代码
pnpm run watch           # 监视模式
pnpm run dev             # 开发模式（同 watch）
pnpm run check           # 代码检查（lint + typecheck）
pnpm run package         # 打包扩展
```

### 开发流程

1. 安装依赖: `pnpm install`
2. 启动开发模式: `pnpm run dev`
3. 在 VS Code 中按 F5 启动扩展进行调试
4. 测试命令: `Template: Hello World` 和 `Template: Open Webview Panel`
5. 查看侧边栏的 `Template View`

## 扩展激活事件

- `onCommand:vscode-extension-template.helloWorld`
- `onCommand:vscode-extension-template.openPanel`
- `onView:template.webviewView`

## 贡献指南

1. 克隆仓库: `git clone <repository-url>`
2. 安装依赖: `pnpm install`
3. 创建分支: `git checkout -b feature/your-feature`
4. 开发功能
5. 运行检查: `pnpm run check`
6. 提交代码: `git commit -m "Add your feature"`
7. 推送分支: `git push origin feature/your-feature`
8. 创建 Pull Request

## 技术实现要点

1. **Vite 多入口编译**: 通过 `vite.config.ts` 配置多个编译入口，为 Panel 和 View 生成不同的构建产物
2. **Webview 通信**: 实现了扩展与 Webview 之间的消息传递
3. **React 集成**: 使用 React 19 构建现代化的 Webview 界面
4. **Tailwind CSS**: 使用 Tailwind CSS 实现响应式设计
5. **TypeScript**: 全项目使用 TypeScript，提供类型安全

## 扩展配置

### package.json 中的贡献配置

- **命令**: 注册了 `vscode-extension-template.helloWorld` 和 `vscode-extension-template.openPanel` 命令
- **视图容器**: 在活动栏添加了 `template-sidebar` 容器
- **视图**: 在侧边栏添加了 `template.webviewView` 视图

## 测试

- 运行测试: `pnpm run test`
- 测试文件位于 `extension/test/runTest.ts`

## 版本历史

- **0.6.1**: 当前版本

## 许可证

MIT 许可证


