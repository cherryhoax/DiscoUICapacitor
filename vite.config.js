import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'DiscoUICapacitor',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@capacitor/core', 'discoui'],
      output: {
        globals: {
          '@capacitor/core': 'capacitorCore',
          'discoui': 'discoui',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
