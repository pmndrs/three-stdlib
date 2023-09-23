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
          function annotate(statement?: babel.types.Expression | null): void {
            if (statement?.type !== 'CallExpression' && statement?.type !== 'NewExpression') return
            if (!statement.leadingComments) statement.leadingComments = []
            statement.leadingComments.push({
              type: 'CommentBlock',
              value: ' @__PURE__ ',
            })
          }
          return babel.transform(code, {
            plugins: [
              {
                visitor: {
                  Program(path) {
                    for (const statement of path.node.body) {
                      if (babel.types.isExpressionStatement(statement)) {
                        annotate(statement.expression)
                      } else if (babel.types.isVariableDeclaration(statement)) {
                        for (const declaration of statement.declarations) {
                          annotate(declaration.init)
                        }
                      }
                    }
                  },
                },
              },
            ],
          }) as any
        },
      },
    },
  ],
})
