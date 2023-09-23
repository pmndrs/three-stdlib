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
          return babel.transform(code, {
            plugins: [
              {
                visitor: {
                  Program(path) {
                    for (const statement of path.node.body) {
                      if (babel.types.isExpressionStatement(statement)) {
                        if (
                          babel.types.isCallExpression(statement.expression) ||
                          babel.types.isNewExpression(statement.expression)
                        ) {
                          statement.expression.leadingComments ||= []
                          statement.expression.leadingComments.push({
                            type: 'CommentBlock',
                            value: ' @__PURE__ ',
                          })
                        }
                      } else if (babel.types.isVariableDeclaration(statement)) {
                        for (const declaration of statement.declarations) {
                          if (
                            declaration.init?.type === 'CallExpression' ||
                            declaration.init?.type === 'NewExpression'
                          ) {
                            declaration.init.leadingComments ||= []
                            declaration.init.leadingComments.push({
                              type: 'CommentBlock',
                              value: ' @__PURE__ ',
                            })
                          }
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
