const shell = require('shelljs')
const fs = require('fs')

const files = shell.find('dist/**/*.d.ts')

for (const file of files) {
  const cts = file.replace('.d.ts', '.d.cts')

  // Add type qualifiers in annotations
  shell.sed('-i', /(import|export)\s+(?!(type|enum|interface|class|function|const|declare)\b)/, '$1 type ', file)
  // Remove .js extensions
  shell.sed('-i', /from '(\.[^.]+)\.js'/, "from '$1'", file)

  fs.copyFileSync(file, cts)

  // Add explicit .d.ts extensions for ESM
  shell.sed('-i', / from '(\.[^']+)'/, " from '$1.d.ts'", file)
  shell.sed('-i', /^declare module '(\.[^']+)'/, "declare module '$1.d.ts'", file)

  // Add explicit .d.cts extensions for CJS
  shell.sed('-i', / from '(\.[^']+)'/, " from '$1.d.cts'", cts)
  shell.sed('-i', /^declare module '(\.[^']+)'/, "declare module '$1.d.cts'", cts)
}
