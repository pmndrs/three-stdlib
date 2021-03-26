const fs = require('fs')
const { recrawl } = require('recrawl')

const THREE_TYPES_ROOT = 'node_modules/@types/three'
const STDLIB_BUILD_ROOT = 'dist'

const crawl = recrawl({
  // only look at the .js files
  skip: ['*.cjs.js', '*.d.ts'],
})

crawl(STDLIB_BUILD_ROOT, (file) => {
  // remove extension
  const fileName = file.split('.js')[0]

  const localFile = `${STDLIB_BUILD_ROOT}/${fileName}.d.ts`
  const externalFile = `${THREE_TYPES_ROOT}/examples/jsm/${fileName}.d.ts`

  // check if there's a local .d.ts file created
  const doesLocalDeclarationExist = fs.existsSync(localFile)
  // check if there's a @types/three .d.ts file created
  const doesExternalDeclarationExist = fs.existsSync(externalFile)

  // if theres no local but a @types/three file
  if (!doesLocalDeclarationExist && doesExternalDeclarationExist) {
    // copy it
    fs.copyFileSync(externalFile, localFile)
    console.log(`copied ${fileName}.d.ts from @types/three`)

    // read the new local file for editing
    fs.readFile(localFile, 'utf8', (err, data) => {
      if (err) throw err
      // this will capture any number of ../ and then src/Three
      var result = data.replace(/[\.\.\/]*src\/Three/, 'three')

      // edit the relative path in .d.ts file
      fs.writeFile(localFile, result, 'utf8', (err) => {
        if (err) throw err
      })
    })
  } else if (doesLocalDeclarationExist) {
    console.log('local declaration file exists')
  } else {
    console.warn('No local or external declaration file exists')
  }
})
