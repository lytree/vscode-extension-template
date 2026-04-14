import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'media',
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: {
        panel: 'src/panel/main.ts',
        view: 'src/view/main.ts'
      }
    }
  }
});
