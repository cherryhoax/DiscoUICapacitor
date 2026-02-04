import { defineConfig } from 'vite';
import { discoUIVitePlugin } from 'discoui-capacitor/vite';
export default defineConfig({
  root: './src',
  plugins: [discoUIVitePlugin()],
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
});
