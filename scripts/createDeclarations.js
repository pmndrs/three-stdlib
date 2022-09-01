const fs = require('fs')
const path = require('path')
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
      let result = data.replace(/[\.\.\/]*src\/Three/, 'three')

      // @types/three mistakenly exports ReflectorForSSRPass as Reflector
      if (fileName === 'objects/ReflectorForSSRPass') {
        result = result.replace(/ReflectorOptions/g, 'ReflectorForSSRPassOptions')
        result = result.replace('class Reflector', 'class ReflectorForSSRPass')
      }

      if (fileName === 'postprocessing/SSRPass') {
        result = result.replace(/\bReflector\b/g, 'ReflectorForSSRPass')
      }

      // three-stdlib exports the class from Water2 as Water2, but three and @types/three export it as Water
      if (fileName === 'objects/Water2') {
        result = result.replace('class Water', 'class Water2')
      }

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

const indexFile = `${STDLIB_BUILD_ROOT}/index.d.ts`
fs.readFile(indexFile, 'utf8', (err, data) => {
  if (err) throw err
  const result = data.replace(/export \* from '([./\w]+)';\s+/g, (match, p1) => {
    const declarationFilePath = path.join(STDLIB_BUILD_ROOT, `${p1}.d.ts`)
    if (!fs.existsSync(declarationFilePath)) {
      console.log(`Removing '${p1}' export from index.d.ts`)
      return ''
    }
    return match
  })
  fs.writeFile(indexFile, result, 'utf8', (err) => {
    if (err) throw err
  })
})
