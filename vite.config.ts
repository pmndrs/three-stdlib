import * as path from 'node:path'
import * as babel from '@babel/core'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    target: 'es2018',
    sourcemap: true,
    lib: {
      formats: ['cjs', 'es'],
      entry: 'src/index.ts',
      fileName: (format) => (format === 'es' ? '[name].js' : '[name].cjs'),
    },
    rollupOptions: {
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
    },
  },
  plugins: [
    {
      name: 'vite-tree-shake',
      renderChunk: {
        order: 'post',
        async handler(code) {
          function annotate(path: babel.NodePath): void {
            if (!path.getFunctionParent()) {
              path.addComment('leading', '@__PURE__')
            }
          }

          return babel.transform(code, {
            sourceMaps: true,
            plugins: [
              {
                visitor: {
                  CallExpression: annotate,
                  NewExpression: annotate,
                },
              },
            ],
          }) as any
        },
      },
    },
  ],
})
