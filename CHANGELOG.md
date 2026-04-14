# Changelog

## 0.6.0

- Replaced esbuild pipeline with Vite multi-entry build.
- Kept separate Panel/View entries while sharing component/hook layers.
- Resolved webview runtime assets via Vite manifest.

## 0.5.1

- Fixed webview runtime asset paths to explicit `media/panel/index.*` and `media/view/index.*`.
- Improved watch workflow to build/watch extension code and both web entries together.
- Fixed panel/view display issue caused by missing web build output in watch mode.
