import * as path from 'path'
import { defineConfig } from 'vite'

const inline: string[] = ['chevrotain']

export default defineConfig({
  build: {
    minify: false,
    target: 'es2018',
    lib: {
      formats: ['cjs', 'es'],
      entry: 'src/index.ts',
      fileName: (format) => (format === 'es' ? '[name].js' : '[name].cjs'),
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id) && !inline.includes(id),
      treeshake: false,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
})
