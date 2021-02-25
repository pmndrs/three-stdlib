This is a stand-alone of https://github.com/mrdoob/three.js/tree/dev/examples/jsm

Our main goals are:

- Real, npm/node conform esm modules with marked dependencies
- Class based, optimized for tree-shaking, no global pollution, exports instead of collections
- A build system for esm and cjs
- Typesafety with simple annotation-like types

But most importantly, allowing the people that uses these primitives to hold a little stake and distribute the weight of maintaining it. The Threejs is arguably quite large in scope, and managing hundreds of extras is not an easy task for just 2-3 maintainers, hence bugs were sometimes left standing, features and extensions are very hard to conclude. We invite each and everyone of you to give jsm/examples the love and care it deserves.
