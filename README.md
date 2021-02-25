This is a stand-alone of https://github.com/mrdoob/three.js/tree/dev/examples/jsm

Our main goals are:

- Real, npm/node conform esm modules with marked dependencies
- Class based, optimized for tree-shaking, no global pollution, exports instead of collections
- A build system for esm and cjs
- Typesafety with simple annotation-like types
- CI, tests, linting, formatting (prettier)

But most importantly, allowing the people that use and rely on these primitives to hold a little stake, and to distribute the weight of maintaining it. The Threejs project is arguably large in scope, and managing hundreds of extras is not an easy task for just 2-3 maintainers, hence bugs were sometimes left standing, features and extensions were very hard to merge. Jsm was always considered a dumping ground, something that you copy/paste into your project and adapt to your needs. But that is not how we used it, and is not how this magnificient collection of helpers should be treated.

We invite each and everyone of you to give jsm/examples the love and care it deserves! Contact us if you need actual stake, and we will gladly review and accept submissions/PR's.
