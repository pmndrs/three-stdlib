import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import multiInput from 'rollup-plugin-multi-input'
import typescript from '@rollup/plugin-typescript'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = (id) => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']

const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [['@babel/preset-env', { loose: true, modules: false, targets }], '@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

export default [
  {
    input: ['src/**/*.js', 'src/**/*.ts', '!src/index.js'],
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      multiInput(),
      json(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.js`,
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      json(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      resolve({ extensions }),
    ],
    preserveModules: true,
  },
  {
    input: ['src/**/*.js', 'src/**/*.ts', '!src/index.js'],
    output: { dir: `dist`, format: 'cjs' },
    external,
    plugins: [
      multiInput({
        transformOutputPath: (output) => output.replace(/\.[^/.]+$/, '.cjs.js'),
      }),
      json(),
      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.js`,
    output: { file: `dist/index.cjs.js`, format: 'cjs' },
    external,
    plugins: [json(), babel(getBabelOptions({ useESModules: false })), resolve({ extensions })],
  },
]
