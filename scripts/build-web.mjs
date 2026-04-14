import { build } from 'esbuild';
import { rm } from 'node:fs/promises';

await rm('media/panel', { recursive: true, force: true });
await rm('media/view', { recursive: true, force: true });

const common = {
  bundle: true,
  sourcemap: false,
  minify: false,
  target: ['es2020'],
  platform: 'browser',
  format: 'iife',
  entryNames: 'index',
  assetNames: 'assets/[name]'
};

await build({
  ...common,
  entryPoints: ['src/panel/main.ts'],
  outdir: 'media/panel'
});

await build({
  ...common,
  entryPoints: ['src/view/main.ts'],
  outdir: 'media/view'
});
