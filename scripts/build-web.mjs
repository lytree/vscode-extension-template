import { build, context } from 'esbuild';
import { rm } from 'node:fs/promises';

const isWatch = process.argv.includes('--watch');

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

const targets = [
  { entryPoints: ['src/panel/main.ts'], outdir: 'media/panel' },
  { entryPoints: ['src/view/main.ts'], outdir: 'media/view' }
];

if (isWatch) {
  const contexts = await Promise.all(targets.map((target) => context({ ...common, ...target })));
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log('[build-web] watching panel/view entries...');
} else {
  await rm('media/panel', { recursive: true, force: true });
  await rm('media/view', { recursive: true, force: true });

  await Promise.all(targets.map((target) => build({ ...common, ...target })));
  console.log('[build-web] build completed.');
}
