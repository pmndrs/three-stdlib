# three-stdlib

[![Version](https://img.shields.io/npm/v/three-stdlib?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/three-stdlib)
[![Downloads](https://img.shields.io/npm/dt/three-stdlib.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/three-stdlib)
[![Twitter](https://img.shields.io/twitter/follow/pmndrs?label=%40pmndrs&style=flat&colorA=000000&colorB=000000&logo=twitter&logoColor=000000)](https://twitter.com/pmndrs)
[![Discord](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/ZZjjNvJ)
[![release](https://github.com/pmndrs/three-stdlib/actions/workflows/main.yml/badge.svg?style=flat&colorA=000000&colorB=000000)](https://github.com/pmndrs/three-stdlib/actions/workflows/main.yml)

Stand-alone version of [threejs/examples/jsm](https://github.com/mrdoob/three.js/tree/dev/examples/jsm) written in Typescript & built for ESM & CJS.

## Basic usage

    npm install three-stdlib

```ts
// Export collection
import * as STDLIB from 'three-stdlib'
// Flatbundle
import { OrbitControls, ... } from 'three-stdlib'
// Pick individual objects
import { OrbitControls } from 'three-stdlib/controls/OrbitControls'
```

## Problem

`threejs/examples` are usually regarded as something that you copy/paste into your project and adapt to your needs. That's not how people use it, and this has caused numerous issues in the past.

## Solution

- A build system for esm and cjs
- Version managed dependencies
- Class based, optimized for tree-shaking, no globals, exports instead of collections
- Single flatbundle as well as individual transpiles
- Typesafety with simple annotation-like types
- CI, tests, linting, formatting (prettier)

But most importantly, allowing more people that use and rely on these primitives to hold a little stake, and to share the weight of maintaining it.

## How to contribute

If you want to get involved you could do any of the following:

- Help to maintain and sync the existing primitives
- Create stories for these examples for our dedicated storybook
- Convert some of the files to Typescript
- Add new examples for the library you think could be helpful for others
