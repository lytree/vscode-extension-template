# Changelog

## 0.6.1

- Adjusted `package.json` scripts to better match the current Vite multi-entry + extension build workflow.
- Added `clean/build/dev/check/package` scripts and standardized compile/watch script layering.

## 0.6.0

- Replaced esbuild pipeline with Vite multi-entry build.
- Kept separate Panel/View entries while sharing component/hook layers.
- Resolved webview runtime assets via Vite manifest.
