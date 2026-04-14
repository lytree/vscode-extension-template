# Changelog

## 0.5.0

- Implemented split web compilation:
  - Panel and View now compile with different entry points.
  - Panel output path and View output path are separated.
- Reused only shared components/hooks under `src/shared`.
- Panel/View pages are independent and no longer share page-level files.

## 0.4.0

- Added both WebviewPanel and WebviewViewProvider pages.
- Reused the same shared web components for both pages.
- Differentiated pages only by frontend entry files (`panel-main.js` and `view-main.js`).
