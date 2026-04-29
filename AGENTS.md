# Fenbi VSCode Extension

## 项目

VSCode 扩展，提供题库、练习历史、历年题库等功能。

## 开发命令

```bash
pnpm run dev           # 监视模式
pnpm run compile      # 编译全部
pnpm run check        # lint + typecheck
pnpm run package      # 打包 VSIX
```

## 架构

- **扩展入口**: `extension/extension.ts`
- **前端入口**: `src/view/main.tsx` (侧边栏视图)
- **前端入口**: `src/panel/main.tsx` (独立面板，未使用)
- **编译**: Vite 多入口 → `media/panel.js`, `media/view.js`

## 已注册命令

| 命令 | 说明 |
|------|------|
| `fenbi.refreshEntry` | 刷新 |
| `fenbi.navigateToTiku` | 题库 |
| `fenbi.navigateToHistory` | 练习历史 |
| `fenbi.navigateToPastYears` | 历年题库 |

激活事件: `onView:fenbi.webviewView`

## 配置

在 VS Code 设置中添加:
- `fenbiTools.cookie` - cookie（必填）
- `fenbiTools.color` - 字体颜色
- `fenbiTools.backgroundColor` - 背景颜色
- `fenbiTools.fontSize` - 字体大小
- `fenbiTools.needLineThrough` - 排除按钮开关