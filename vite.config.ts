import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from 'path';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: 'media',
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: {
        panel: 'src/panel/main.tsx',
        view: 'src/view/main.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        // 2. 分包/懒加载 JS 文件输出配置
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // 设置不同类型文件的输出路径及命名规则
          if (
            assetInfo.type === 'asset' &&
            /\.(jpe?g|png|gif|svg)$/i.test(assetInfo.name ?? "")
          ) {
            return 'img/[name].[ext]' // 图像文件输出路径及命名规则
          }
          if (
            assetInfo.type === 'asset' &&
            /\.(ttf|woff|woff2|eot)$/i.test(assetInfo.name ?? "")
          ) {
            return 'fonts/[name].[ext]' // 字体文件输出路径及命名规则
          }
          return '[ext]/[name]-[hash].[ext]' // 其他资源文件输出路径及命名规则
        }
      }
    }
  }
});
