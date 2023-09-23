import * as path from 'node:path'
import * as babel from '@babel/core'
import { defineConfig } from 'vite'

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
      external: (id: string) => !id.startsWith('.') && !path.isAbsolute(id),
    },
  },
  plugins: [
    {
      name: 'vite-tree-shake',
      renderChunk: {
        order: 'post',
        async handler(code) {
          function annotate(statement: babel.NodePath): void {
            if (statement?.parent.type === 'Program') {
              statement.addComment('leading', ' @__PURE__ ')
            }
          }

          return babel.transform(code, {
            plugins: [
              {
                visitor: {
                  ExpressionStatement: annotate,
                  VariableDeclaration: annotate,
                },
              },
            ],
          }) as any
        },
      },
    },
  ],
})
