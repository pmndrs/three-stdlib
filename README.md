This is a stand-alone of https://github.com/mrdoob/three.js/tree/dev/examples/jsm

Our main goals are:

- Real, npm/node conform esm modules with marked dependencies
- Class based, optimized for tree-shaking, no global pollution, exports instead of collections
- A build system for esm and cjs
- Typesafety with simple annotation-like types
- CI, tests, linting, formatting (prettier)

But most importantly, allowing the people that use and rely on these primitives to hold a little stake, and to distribute the weight of maintaining it. Jsm/examples were always considered as something that you copy/paste into your project and adapt to your needs. But that is not how people use it.

Let's give jsm/examples the care it deserves!
