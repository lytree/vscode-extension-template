# Changelog

## 0.5.1

- Fixed webview runtime asset paths to explicit `media/panel/index.*` and `media/view/index.*`.
- Improved watch workflow to build/watch extension code and both web entries together.
- Fixed panel/view display issue caused by missing web build output in watch mode.

## 0.5.0

- Implemented split web compilation:
  - Panel and View now compile with different entry points.
  - Panel output path and View output path are separated.
- Reused only shared components/hooks under `src/shared`.
- Panel/View pages are independent and no longer share page-level files.
