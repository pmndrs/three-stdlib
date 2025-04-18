const { CstParser, Lexer, createToken } = /* @__PURE__ */ (() => {
  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global

  const freeGlobal$1 = freeGlobal

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self

  /** Used as a reference to the global object. */
  var root = freeGlobal$1 || freeSelf || Function('return this')()

  const root$1 = root

  /** Built-in value references. */
  var Symbol$1 = root$1.Symbol

  const Symbol$2 = Symbol$1

  /** Used for built-in method references. */
  var objectProto$j = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$g = objectProto$j.hasOwnProperty

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$j.toString

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty$g.call(value, symToStringTag$1),
      tag = value[symToStringTag$1]

    try {
      value[symToStringTag$1] = undefined
      var unmasked = true
    } catch (e) {}

    var result = nativeObjectToString$1.call(value)
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag
      } else {
        delete value[symToStringTag$1]
      }
    }
    return result
  }

  /** Used for built-in method references. */
  var objectProto$i = Object.prototype

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$i.toString

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value)
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]'

  /** Built-in value references. */
  var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value)
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object'
  }

  /** `Object#toString` result references. */
  var symbolTag$3 = '[object Symbol]'

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' || (isObjectLike(value) && baseGetTag(value) == symbolTag$3)
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length)

    while (++index < length) {
      result[index] = iteratee(array[index], index, array)
    }
    return result
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray

  const isArray$1 = isArray

  /** Used as references for various `Number` constants. */
  var INFINITY$3 = 1 / 0

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$2 = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolToString = symbolProto$2 ? symbolProto$2.toString : undefined

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value
    }
    if (isArray$1(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + ''
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : ''
    }
    var result = value + ''
    return result == '0' && 1 / value == -INFINITY$3 ? '-0' : result
  }

  /** Used to match a single whitespace character. */
  var reWhitespace = /\s/

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedEndIndex(string) {
    var index = string.length

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index
  }

  /** Used to match leading whitespace. */
  var reTrimStart = /^\s+/

  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */
  function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '') : string
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value
    return value != null && (type == 'object' || type == 'function')
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value
    }
    if (isSymbol(value)) {
      return NAN
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value
      value = isObject(other) ? other + '' : other
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value
    }
    value = baseTrim(value)
    var isBinary = reIsBinary.test(value)
    return isBinary || reIsOctal.test(value)
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : reIsBadHex.test(value)
      ? NAN
      : +value
  }

  /** Used as references for various `Number` constants. */
  var INFINITY$2 = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e308

  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0
    }
    value = toNumber(value)
    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = value < 0 ? -1 : 1
      return sign * MAX_INTEGER
    }
    return value === value ? value : 0
  }

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */
  function toInteger(value) {
    var result = toFinite(value),
      remainder = result % 1

    return result === result ? (remainder ? result - remainder : result) : 0
  }

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]'

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value)
    return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag
  }

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root$1['__core-js_shared__']

  const coreJsData$1 = coreJsData

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function () {
    var uid = /[^.]+$/.exec((coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO) || '')
    return uid ? 'Symbol(src)_1.' + uid : ''
  })()

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func
  }

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString$1.call(func)
      } catch (e) {}
      try {
        return func + ''
      } catch (e) {}
    }
    return ''
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
    objectProto$h = Object.prototype

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString

  /** Used to check objects for own properties. */
  var hasOwnProperty$f = objectProto$h.hasOwnProperty

  /** Used to detect if a method is native. */
  var reIsNative = RegExp(
    '^' +
      funcToString
        .call(hasOwnProperty$f)
        .replace(reRegExpChar, '\\$&')
        .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
      '$',
  )

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor
    return pattern.test(toSource(value))
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key]
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key)
    return baseIsNative(value) ? value : undefined
  }

  /* Built-in method references that are verified to be native. */
  var WeakMap = getNative(root$1, 'WeakMap')

  const WeakMap$1 = WeakMap

  /** Built-in value references. */
  var objectCreate = Object.create

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function () {
    function object() {}
    return function (proto) {
      if (!isObject(proto)) {
        return {}
      }
      if (objectCreate) {
        return objectCreate(proto)
      }
      object.prototype = proto
      var result = new object()
      object.prototype = undefined
      return result
    }
  })()

  const baseCreate$1 = baseCreate

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg)
      case 1:
        return func.call(thisArg, args[0])
      case 2:
        return func.call(thisArg, args[0], args[1])
      case 3:
        return func.call(thisArg, args[0], args[1], args[2])
    }
    return func.apply(thisArg, args)
  }

  /**
   * This method returns `undefined`.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Util
   * @example
   *
   * _.times(2, _.noop);
   * // => [undefined, undefined]
   */
  function noop() {
    // No operation performed.
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
      length = source.length

    array || (array = Array(length))
    while (++index < length) {
      array[index] = source[index]
    }
    return array
  }

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
    HOT_SPAN = 16

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeNow = Date.now

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
      lastCalled = 0

    return function () {
      var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled)

      lastCalled = stamp
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0]
        }
      } else {
        count = 0
      }
      return func.apply(undefined, arguments)
    }
  }

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function () {
      return value
    }
  }

  var defineProperty = (function () {
    try {
      var func = getNative(Object, 'defineProperty')
      func({}, '', {})
      return func
    } catch (e) {}
  })()

  const defineProperty$1 = defineProperty

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !defineProperty$1
    ? identity
    : function (func, string) {
        return defineProperty$1(func, 'toString', {
          configurable: true,
          enumerable: false,
          value: constant(string),
          writable: true,
        })
      }

  const baseSetToString$1 = baseSetToString

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = shortOut(baseSetToString$1)

  const setToString$1 = setToString

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break
      }
    }
    return array
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1)

    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index
      }
    }
    return -1
  }

  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */
  function baseIsNaN(value) {
    return value !== value
  }

  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
      length = array.length

    while (++index < length) {
      if (array[index] === value) {
        return index
      }
    }
    return -1
  }

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex)
  }

  /**
   * A specialized version of `_.includes` for arrays without support for
   * specifying an index to search from.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length
    return !!length && baseIndexOf(array, value, 0) > -1
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value
    length = length == null ? MAX_SAFE_INTEGER$1 : length

    return (
      !!length &&
      (type == 'number' || (type != 'symbol' && reIsUint.test(value))) &&
      value > -1 &&
      value % 1 == 0 &&
      value < length
    )
  }

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty$1) {
      defineProperty$1(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true,
      })
    } else {
      object[key] = value
    }
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other)
  }

  /** Used for built-in method references. */
  var objectProto$g = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$e = objectProto$g.hasOwnProperty

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key]
    if (!(hasOwnProperty$e.call(object, key) && eq(objValue, value)) || (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value)
    }
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object
    object || (object = {})

    var index = -1,
      length = props.length

    while (++index < length) {
      var key = props[index]

      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined

      if (newValue === undefined) {
        newValue = source[key]
      }
      if (isNew) {
        baseAssignValue(object, key, newValue)
      } else {
        assignValue(object, key, newValue)
      }
    }
    return object
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax$3 = Math.max

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax$3(start === undefined ? func.length - 1 : start, 0)
    return function () {
      var args = arguments,
        index = -1,
        length = nativeMax$3(args.length - start, 0),
        array = Array(length)

      while (++index < length) {
        array[index] = args[start + index]
      }
      index = -1
      var otherArgs = Array(start + 1)
      while (++index < start) {
        otherArgs[index] = args[index]
      }
      otherArgs[start] = transform(array)
      return apply(func, this, otherArgs)
    }
  }

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return setToString$1(overRest(func, start, identity), func + '')
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value)
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false
    }
    var type = typeof index
    if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
      return eq(object[index], value)
    }
    return false
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return baseRest(function (object, sources) {
      var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined

      customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer
        length = 1
      }
      object = Object(object)
      while (++index < length) {
        var source = sources[index]
        if (source) {
          assigner(object, source, index, customizer)
        }
      }
      return object
    })
  }

  /** Used for built-in method references. */
  var objectProto$f = Object.prototype

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$f

    return value === proto
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
      result = Array(n)

    while (++index < n) {
      result[index] = iteratee(index)
    }
    return result
  }

  /** `Object#toString` result references. */
  var argsTag$3 = '[object Arguments]'

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag$3
  }

  /** Used for built-in method references. */
  var objectProto$e = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$d = objectProto$e.hasOwnProperty

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$e.propertyIsEnumerable

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(
    (function () {
      return arguments
    })(),
  )
    ? baseIsArguments
    : function (value) {
        return (
          isObjectLike(value) && hasOwnProperty$d.call(value, 'callee') && !propertyIsEnumerable$1.call(value, 'callee')
        )
      }

  const isArguments$1 = isArguments

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false
  }

  /** Detect free variable `exports`. */
  var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports

  /** Detect free variable `module`. */
  var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2

  /** Built-in value references. */
  var Buffer$1 = moduleExports$2 ? root$1.Buffer : undefined

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse

  const isBuffer$1 = isBuffer

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]',
    arrayTag$2 = '[object Array]',
    boolTag$3 = '[object Boolean]',
    dateTag$3 = '[object Date]',
    errorTag$2 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$6 = '[object Map]',
    numberTag$3 = '[object Number]',
    objectTag$3 = '[object Object]',
    regexpTag$4 = '[object RegExp]',
    setTag$6 = '[object Set]',
    stringTag$4 = '[object String]',
    weakMapTag$2 = '[object WeakMap]'

  var arrayBufferTag$3 = '[object ArrayBuffer]',
    dataViewTag$4 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]'

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {}
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[
    int16Tag$2
  ] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[
    uint16Tag$2
  ] = typedArrayTags[uint32Tag$2] = true
  typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] = typedArrayTags[arrayBufferTag$3] = typedArrayTags[
    boolTag$3
  ] = typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] = typedArrayTags[errorTag$2] = typedArrayTags[
    funcTag$1
  ] = typedArrayTags[mapTag$6] = typedArrayTags[numberTag$3] = typedArrayTags[objectTag$3] = typedArrayTags[
    regexpTag$4
  ] = typedArrayTags[setTag$6] = typedArrayTags[stringTag$4] = typedArrayTags[weakMapTag$2] = false

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)]
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function (value) {
      return func(value)
    }
  }

  /** Detect free variable `exports`. */
  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports

  /** Detect free variable `module`. */
  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports$1 && freeGlobal$1.process

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function () {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types

      if (types) {
        return types
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util')
    } catch (e) {}
  })()

  const nodeUtil$1 = nodeUtil

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil$1 && nodeUtil$1.isTypedArray

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray

  const isTypedArray$1 = isTypedArray

  /** Used for built-in method references. */
  var objectProto$d = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$c = objectProto$d.hasOwnProperty

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray$1(value),
      isArg = !isArr && isArguments$1(value),
      isBuff = !isArr && !isArg && isBuffer$1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length

    for (var key in value) {
      if (
        (inherited || hasOwnProperty$c.call(value, key)) &&
        !(
          skipIndexes &&
          // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == 'length' ||
            // Node.js 0.10 has enumerable non-index properties on buffers.
            (isBuff && (key == 'offset' || key == 'parent')) ||
            // PhantomJS 2 has enumerable non-index properties on typed arrays.
            (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
            // Skip index properties.
            isIndex(key, length))
        )
      ) {
        result.push(key)
      }
    }
    return result
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg))
    }
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = overArg(Object.keys, Object)

  const nativeKeys$1 = nativeKeys

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$b = objectProto$c.hasOwnProperty

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys$1(object)
    }
    var result = []
    for (var key in Object(object)) {
      if (hasOwnProperty$b.call(object, key) && key != 'constructor') {
        result.push(key)
      }
    }
    return result
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object)
  }

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$a = objectProto$b.hasOwnProperty

  /**
   * Assigns own enumerable string keyed properties of source objects to the
   * destination object. Source objects are applied from left to right.
   * Subsequent sources overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object` and is loosely based on
   * [`Object.assign`](https://mdn.io/Object/assign).
   *
   * @static
   * @memberOf _
   * @since 0.10.0
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.assignIn
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * function Bar() {
   *   this.c = 3;
   * }
   *
   * Foo.prototype.b = 2;
   * Bar.prototype.d = 4;
   *
   * _.assign({ 'a': 0 }, new Foo, new Bar);
   * // => { 'a': 1, 'c': 3 }
   */
  var assign = createAssigner(function (object, source) {
    if (isPrototype(source) || isArrayLike(source)) {
      copyObject(source, keys(source), object)
      return
    }
    for (var key in source) {
      if (hasOwnProperty$a.call(source, key)) {
        assignValue(object, key, source[key])
      }
    }
  })

  const assign$1 = assign

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = []
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key)
      }
    }
    return result
  }

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$a.hasOwnProperty

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object)
    }
    var isProto = isPrototype(object),
      result = []

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
        result.push(key)
      }
    }
    return result
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object)
  }

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/

  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey(value, object) {
    if (isArray$1(value)) {
      return false
    }
    var type = typeof value
    if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
      return true
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (object != null && value in Object(object))
  }

  /* Built-in method references that are verified to be native. */
  var nativeCreate = getNative(Object, 'create')

  const nativeCreate$1 = nativeCreate

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {}
    this.size = 0
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key]
    this.size -= result ? 1 : 0
    return result
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__'

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$9.hasOwnProperty

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__
    if (nativeCreate$1) {
      var result = data[key]
      return result === HASH_UNDEFINED$2 ? undefined : result
    }
    return hasOwnProperty$8.call(data, key) ? data[key] : undefined
  }

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$8.hasOwnProperty

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__
    return nativeCreate$1 ? data[key] !== undefined : hasOwnProperty$7.call(data, key)
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__'

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__
    this.size += this.has(key) ? 0 : 1
    data[key] = nativeCreate$1 && value === undefined ? HASH_UNDEFINED$1 : value
    return this
  }

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
      length = entries == null ? 0 : entries.length

    this.clear()
    while (++index < length) {
      var entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear
  Hash.prototype['delete'] = hashDelete
  Hash.prototype.get = hashGet
  Hash.prototype.has = hashHas
  Hash.prototype.set = hashSet

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = []
    this.size = 0
  }

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length
    while (length--) {
      if (eq(array[length][0], key)) {
        return length
      }
    }
    return -1
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype

  /** Built-in value references. */
  var splice = arrayProto.splice

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
      index = assocIndexOf(data, key)

    if (index < 0) {
      return false
    }
    var lastIndex = data.length - 1
    if (index == lastIndex) {
      data.pop()
    } else {
      splice.call(data, index, 1)
    }
    --this.size
    return true
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
      index = assocIndexOf(data, key)

    return index < 0 ? undefined : data[index][1]
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
      index = assocIndexOf(data, key)

    if (index < 0) {
      ++this.size
      data.push([key, value])
    } else {
      data[index][1] = value
    }
    return this
  }

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
      length = entries == null ? 0 : entries.length

    this.clear()
    while (++index < length) {
      var entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear
  ListCache.prototype['delete'] = listCacheDelete
  ListCache.prototype.get = listCacheGet
  ListCache.prototype.has = listCacheHas
  ListCache.prototype.set = listCacheSet

  /* Built-in method references that are verified to be native. */
  var Map$1 = getNative(root$1, 'Map')

  const Map$2 = Map$1

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0
    this.__data__ = {
      hash: new Hash(),
      map: new (Map$2 || ListCache)(),
      string: new Hash(),
    }
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value
    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean'
      ? value !== '__proto__'
      : value === null
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__
    return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key)
    this.size -= result ? 1 : 0
    return result
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key)
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key)
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
      size = data.size

    data.set(key, value)
    this.size += data.size == size ? 0 : 1
    return this
  }

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
      length = entries == null ? 0 : entries.length

    this.clear()
    while (++index < length) {
      var entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear
  MapCache.prototype['delete'] = mapCacheDelete
  MapCache.prototype.get = mapCacheGet
  MapCache.prototype.has = mapCacheHas
  MapCache.prototype.set = mapCacheSet

  /** Error message constants. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function'

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `clear`, `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT$1)
    }
    var memoized = function () {
      var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache

      if (cache.has(key)) {
        return cache.get(key)
      }
      var result = func.apply(this, args)
      memoized.cache = cache.set(key, result) || cache
      return result
    }
    memoized.cache = new (memoize.Cache || MapCache)()
    return memoized
  }

  // Expose `MapCache`.
  memoize.Cache = MapCache

  /** Used as the maximum memoize cache size. */
  var MAX_MEMOIZE_SIZE = 500

  /**
   * A specialized version of `_.memoize` which clears the memoized function's
   * cache when it exceeds `MAX_MEMOIZE_SIZE`.
   *
   * @private
   * @param {Function} func The function to have its output memoized.
   * @returns {Function} Returns the new memoized function.
   */
  function memoizeCapped(func) {
    var result = memoize(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear()
      }
      return key
    })

    var cache = result.cache
    return result
  }

  /** Used to match property names within property paths. */
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  var stringToPath = memoizeCapped(function (string) {
    var result = []
    if (string.charCodeAt(0) === 46 /* . */) {
      result.push('')
    }
    string.replace(rePropName, function (match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match)
    })
    return result
  })

  const stringToPath$1 = stringToPath

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value)
  }

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @param {Object} [object] The object to query keys on.
   * @returns {Array} Returns the cast property path array.
   */
  function castPath(value, object) {
    if (isArray$1(value)) {
      return value
    }
    return isKey(value, object) ? [value] : stringToPath$1(toString(value))
  }

  /** Used as references for various `Number` constants. */
  var INFINITY$1 = 1 / 0

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value
    }
    var result = value + ''
    return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result
  }

  /**
   * The base implementation of `_.get` without support for default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @returns {*} Returns the resolved value.
   */
  function baseGet(object, path) {
    path = castPath(path, object)

    var index = 0,
      length = path.length

    while (object != null && index < length) {
      object = object[toKey(path[index++])]
    }
    return index && index == length ? object : undefined
  }

  /**
   * Gets the value at `path` of `object`. If the resolved value is
   * `undefined`, the `defaultValue` is returned in its place.
   *
   * @static
   * @memberOf _
   * @since 3.7.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned for `undefined` resolved values.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path)
    return result === undefined ? defaultValue : result
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
      length = values.length,
      offset = array.length

    while (++index < length) {
      array[offset + index] = values[index]
    }
    return array
  }

  /** Built-in value references. */
  var spreadableSymbol = Symbol$2 ? Symbol$2.isConcatSpreadable : undefined

  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
  function isFlattenable(value) {
    return isArray$1(value) || isArguments$1(value) || !!(spreadableSymbol && value && value[spreadableSymbol])
  }

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
      length = array.length

    predicate || (predicate = isFlattenable)
    result || (result = [])

    while (++index < length) {
      var value = array[index]
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result)
        } else {
          arrayPush(result, value)
        }
      } else if (!isStrict) {
        result[result.length] = value
      }
    }
    return result
  }

  /**
   * Flattens `array` a single level deep.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, [3, [4]], 5]]);
   * // => [1, 2, [3, [4]], 5]
   */
  function flatten(array) {
    var length = array == null ? 0 : array.length
    return length ? baseFlatten(array, 1) : []
  }

  /** Built-in value references. */
  var getPrototype = overArg(Object.getPrototypeOf, Object)

  const getPrototype$1 = getPrototype

  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
  function baseSlice(array, start, end) {
    var index = -1,
      length = array.length

    if (start < 0) {
      start = -start > length ? 0 : length + start
    }
    end = end > length ? length : end
    if (end < 0) {
      end += length
    }
    length = start > end ? 0 : (end - start) >>> 0
    start >>>= 0

    var result = Array(length)
    while (++index < length) {
      result[index] = array[index + start]
    }
    return result
  }

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
      length = array == null ? 0 : array.length

    if (initAccum && length) {
      accumulator = array[++index]
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array)
    }
    return accumulator
  }

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new ListCache()
    this.size = 0
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
      result = data['delete'](key)

    this.size = data.size
    return result
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key)
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key)
  }

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE$2 = 200

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__
    if (data instanceof ListCache) {
      var pairs = data.__data__
      if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE$2 - 1) {
        pairs.push([key, value])
        this.size = ++data.size
        return this
      }
      data = this.__data__ = new MapCache(pairs)
    }
    data.set(key, value)
    this.size = data.size
    return this
  }

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = (this.__data__ = new ListCache(entries))
    this.size = data.size
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = stackClear
  Stack.prototype['delete'] = stackDelete
  Stack.prototype.get = stackGet
  Stack.prototype.has = stackHas
  Stack.prototype.set = stackSet

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object)
  }

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object)
  }

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports

  /** Built-in value references. */
  var Buffer = moduleExports ? root$1.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice()
    }
    var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length)

    buffer.copy(result)
    return result
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = []

    while (++index < length) {
      var value = array[index]
      if (predicate(value, index, array)) {
        result[resIndex++] = value
      }
    }
    return result
  }

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return []
  }

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$7.propertyIsEnumerable

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols$1
    ? stubArray
    : function (object) {
        if (object == null) {
          return []
        }
        object = Object(object)
        return arrayFilter(nativeGetSymbols$1(object), function (symbol) {
          return propertyIsEnumerable.call(object, symbol)
        })
      }

  const getSymbols$1 = getSymbols

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return copyObject(source, getSymbols$1(source), object)
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn = !nativeGetSymbols
    ? stubArray
    : function (object) {
        var result = []
        while (object) {
          arrayPush(result, getSymbols$1(object))
          object = getPrototype$1(object)
        }
        return result
      }

  const getSymbolsIn$1 = getSymbolsIn

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn$1(source), object)
  }

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object)
    return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object))
  }

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols$1)
  }

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn$1)
  }

  /* Built-in method references that are verified to be native. */
  var DataView = getNative(root$1, 'DataView')

  const DataView$1 = DataView

  /* Built-in method references that are verified to be native. */
  var Promise$1 = getNative(root$1, 'Promise')

  const Promise$2 = Promise$1

  /* Built-in method references that are verified to be native. */
  var Set = getNative(root$1, 'Set')

  const Set$1 = Set

  /** `Object#toString` result references. */
  var mapTag$5 = '[object Map]',
    objectTag$2 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$5 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]'

  var dataViewTag$3 = '[object DataView]'

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView$1),
    mapCtorString = toSource(Map$2),
    promiseCtorString = toSource(Promise$2),
    setCtorString = toSource(Set$1),
    weakMapCtorString = toSource(WeakMap$1)

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = baseGetTag

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if (
    (DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag$3) ||
    (Map$2 && getTag(new Map$2()) != mapTag$5) ||
    (Promise$2 && getTag(Promise$2.resolve()) != promiseTag) ||
    (Set$1 && getTag(new Set$1()) != setTag$5) ||
    (WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag$1)
  ) {
    getTag = function (value) {
      var result = baseGetTag(value),
        Ctor = result == objectTag$2 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : ''

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag$3
          case mapCtorString:
            return mapTag$5
          case promiseCtorString:
            return promiseTag
          case setCtorString:
            return setTag$5
          case weakMapCtorString:
            return weakMapTag$1
        }
      }
      return result
    }
  }

  const getTag$1 = getTag

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$6.hasOwnProperty

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
      result = new array.constructor(length)

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty$6.call(array, 'index')) {
      result.index = array.index
      result.input = array.input
    }
    return result
  }

  /** Built-in value references. */
  var Uint8Array = root$1.Uint8Array

  const Uint8Array$1 = Uint8Array

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength)
    new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer))
    return result
  }

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength)
  }

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp))
    result.lastIndex = regexp.lastIndex
    return result
  }

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : undefined

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {}
  }

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length)
  }

  /** `Object#toString` result references. */
  var boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    mapTag$4 = '[object Map]',
    numberTag$2 = '[object Number]',
    regexpTag$3 = '[object RegExp]',
    setTag$4 = '[object Set]',
    stringTag$3 = '[object String]',
    symbolTag$2 = '[object Symbol]'

  var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]'

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor
    switch (tag) {
      case arrayBufferTag$2:
        return cloneArrayBuffer(object)

      case boolTag$2:
      case dateTag$2:
        return new Ctor(+object)

      case dataViewTag$2:
        return cloneDataView(object, isDeep)

      case float32Tag$1:
      case float64Tag$1:
      case int8Tag$1:
      case int16Tag$1:
      case int32Tag$1:
      case uint8Tag$1:
      case uint8ClampedTag$1:
      case uint16Tag$1:
      case uint32Tag$1:
        return cloneTypedArray(object, isDeep)

      case mapTag$4:
        return new Ctor()

      case numberTag$2:
      case stringTag$3:
        return new Ctor(object)

      case regexpTag$3:
        return cloneRegExp(object)

      case setTag$4:
        return new Ctor()

      case symbolTag$2:
        return cloneSymbol(object)
    }
  }

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate$1(getPrototype$1(object)) : {}
  }

  /** `Object#toString` result references. */
  var mapTag$3 = '[object Map]'

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap(value) {
    return isObjectLike(value) && getTag$1(value) == mapTag$3
  }

  /* Node.js helper references. */
  var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap

  const isMap$1 = isMap

  /** `Object#toString` result references. */
  var setTag$3 = '[object Set]'

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet(value) {
    return isObjectLike(value) && getTag$1(value) == setTag$3
  }

  /* Node.js helper references. */
  var nodeIsSet = nodeUtil$1 && nodeUtil$1.isSet

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet

  const isSet$1 = isSet

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG$1 = 4

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag$2 = '[object Map]',
    numberTag$1 = '[object Number]',
    objectTag$1 = '[object Object]',
    regexpTag$2 = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$1 = '[object Symbol]',
    weakMapTag = '[object WeakMap]'

  var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]'

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {}
  cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$1] = cloneableTags[
    dataViewTag$1
  ] = cloneableTags[boolTag$1] = cloneableTags[dateTag$1] = cloneableTags[float32Tag] = cloneableTags[
    float64Tag
  ] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[
    mapTag$2
  ] = cloneableTags[numberTag$1] = cloneableTags[objectTag$1] = cloneableTags[regexpTag$2] = cloneableTags[
    setTag$2
  ] = cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag] = cloneableTags[
    uint8ClampedTag
  ] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true
  cloneableTags[errorTag$1] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$1

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value)
    }
    if (result !== undefined) {
      return result
    }
    if (!isObject(value)) {
      return value
    }
    var isArr = isArray$1(value)
    if (isArr) {
      result = initCloneArray(value)
      if (!isDeep) {
        return copyArray(value, result)
      }
    } else {
      var tag = getTag$1(value),
        isFunc = tag == funcTag || tag == genTag

      if (isBuffer$1(value)) {
        return cloneBuffer(value, isDeep)
      }
      if (tag == objectTag$1 || tag == argsTag$1 || (isFunc && !object)) {
        result = isFlat || isFunc ? {} : initCloneObject(value)
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value))
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {}
        }
        result = initCloneByTag(value, tag, isDeep)
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack())
    var stacked = stack.get(value)
    if (stacked) {
      return stacked
    }
    stack.set(value, result)

    if (isSet$1(value)) {
      value.forEach(function (subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack))
      })
    } else if (isMap$1(value)) {
      value.forEach(function (subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack))
      })
    }

    var keysFunc = isFull ? (isFlat ? getAllKeysIn : getAllKeys) : isFlat ? keysIn : keys

    var props = isArr ? undefined : keysFunc(value)
    arrayEach(props || value, function (subValue, key) {
      if (props) {
        key = subValue
        subValue = value[key]
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack))
    })
    return result
  }

  /** Used to compose bitmasks for cloning. */
  var CLONE_SYMBOLS_FLAG = 4

  /**
   * Creates a shallow clone of `value`.
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
   * and supports cloning arrays, array buffers, booleans, date objects, maps,
   * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
   * arrays. The own enumerable properties of `arguments` objects are cloned
   * as plain objects. An empty object is returned for uncloneable values such
   * as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to clone.
   * @returns {*} Returns the cloned value.
   * @see _.cloneDeep
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var shallow = _.clone(objects);
   * console.log(shallow[0] === objects[0]);
   * // => true
   */
  function clone(value) {
    return baseClone(value, CLONE_SYMBOLS_FLAG)
  }

  /**
   * Creates an array with all falsey values removed. The values `false`, `null`,
   * `0`, `""`, `undefined`, and `NaN` are falsey.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to compact.
   * @returns {Array} Returns the new array of filtered values.
   * @example
   *
   * _.compact([0, 1, false, 2, '', 3]);
   * // => [1, 2, 3]
   */
  function compact(array) {
    var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = []

    while (++index < length) {
      var value = array[index]
      if (value) {
        result[resIndex++] = value
      }
    }
    return result
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__'

  /**
   * Adds `value` to the array cache.
   *
   * @private
   * @name add
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED)
    return this
  }

  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */
  function setCacheHas(value) {
    return this.__data__.has(value)
  }

  /**
   *
   * Creates an array cache object to store unique values.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  function SetCache(values) {
    var index = -1,
      length = values == null ? 0 : values.length

    this.__data__ = new MapCache()
    while (++index < length) {
      this.add(values[index])
    }
  }

  // Add methods to `SetCache`.
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd
  SetCache.prototype.has = setCacheHas

  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function arraySome(array, predicate) {
    var index = -1,
      length = array == null ? 0 : array.length

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true
      }
    }
    return false
  }

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function cacheHas(cache, key) {
    return cache.has(key)
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2

  /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `array` and `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
      arrLength = array.length,
      othLength = other.length

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false
    }
    // Check that cyclic values are equal.
    var arrStacked = stack.get(array)
    var othStacked = stack.get(other)
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array
    }
    var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : undefined

    stack.set(array, other)
    stack.set(other, array)

    // Ignore non-index properties.
    while (++index < arrLength) {
      var arrValue = array[index],
        othValue = other[index]

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, arrValue, index, other, array, stack)
          : customizer(arrValue, othValue, index, array, other, stack)
      }
      if (compared !== undefined) {
        if (compared) {
          continue
        }
        result = false
        break
      }
      // Recursively compare arrays (susceptible to call stack limits).
      if (seen) {
        if (
          !arraySome(other, function (othValue, othIndex) {
            if (
              !cacheHas(seen, othIndex) &&
              (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))
            ) {
              return seen.push(othIndex)
            }
          })
        ) {
          result = false
          break
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false
        break
      }
    }
    stack['delete'](array)
    stack['delete'](other)
    return result
  }

  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */
  function mapToArray(map) {
    var index = -1,
      result = Array(map.size)

    map.forEach(function (value, key) {
      result[++index] = [key, value]
    })
    return result
  }

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
      result = Array(set.size)

    set.forEach(function (value) {
      result[++index] = value
    })
    return result
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2

  /** `Object#toString` result references. */
  var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag$1 = '[object Map]',
    numberTag = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]'

  var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]'

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined

  /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false
        }
        object = object.buffer
        other = other.buffer

      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
          return false
        }
        return true

      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq(+object, +other)

      case errorTag:
        return object.name == other.name && object.message == other.message

      case regexpTag$1:
      case stringTag$1:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == other + ''

      case mapTag$1:
        var convert = mapToArray

      case setTag$1:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4
        convert || (convert = setToArray)

        if (object.size != other.size && !isPartial) {
          return false
        }
        // Assume cyclic values are equal.
        var stacked = stack.get(object)
        if (stacked) {
          return stacked == other
        }
        bitmask |= COMPARE_UNORDERED_FLAG$2

        // Recursively compare objects (susceptible to call stack limits).
        stack.set(object, other)
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack)
        stack['delete'](object)
        return result

      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other)
        }
    }
    return false
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$3 = 1

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$5.hasOwnProperty

  /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length

    if (objLength != othLength && !isPartial) {
      return false
    }
    var index = objLength
    while (index--) {
      var key = objProps[index]
      if (!(isPartial ? key in other : hasOwnProperty$5.call(other, key))) {
        return false
      }
    }
    // Check that cyclic values are equal.
    var objStacked = stack.get(object)
    var othStacked = stack.get(other)
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object
    }
    var result = true
    stack.set(object, other)
    stack.set(other, object)

    var skipCtor = isPartial
    while (++index < objLength) {
      key = objProps[index]
      var objValue = object[key],
        othValue = other[key]

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack)
      }
      // Recursively compare objects (susceptible to call stack limits).
      if (
        !(compared === undefined
          ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)
          : compared)
      ) {
        result = false
        break
      }
      skipCtor || (skipCtor = key == 'constructor')
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
        othCtor = other.constructor

      // Non `Object` object instances with different constructors are not equal.
      if (
        objCtor != othCtor &&
        'constructor' in object &&
        'constructor' in other &&
        !(
          typeof objCtor == 'function' &&
          objCtor instanceof objCtor &&
          typeof othCtor == 'function' &&
          othCtor instanceof othCtor
        )
      ) {
        result = false
      }
    }
    stack['delete'](object)
    stack['delete'](other)
    return result
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$2 = 1

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]'

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$4.hasOwnProperty

  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray$1(object),
      othIsArr = isArray$1(other),
      objTag = objIsArr ? arrayTag : getTag$1(object),
      othTag = othIsArr ? arrayTag : getTag$1(other)

    objTag = objTag == argsTag ? objectTag : objTag
    othTag = othTag == argsTag ? objectTag : othTag

    var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag

    if (isSameTag && isBuffer$1(object)) {
      if (!isBuffer$1(other)) {
        return false
      }
      objIsArr = true
      objIsObj = false
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack())
      return objIsArr || isTypedArray$1(object)
        ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
        : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack)
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
      var objIsWrapped = objIsObj && hasOwnProperty$4.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$4.call(other, '__wrapped__')

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other

        stack || (stack = new Stack())
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack)
      }
    }
    if (!isSameTag) {
      return false
    }
    stack || (stack = new Stack())
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack)
  }

  /**
   * The base implementation of `_.isEqual` which supports partial comparisons
   * and tracks traversed objects.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Unordered comparison
   *  2 - Partial comparison
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {Object} [stack] Tracks traversed `value` and `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
      return value !== value && other !== other
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack)
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2

  /**
   * The base implementation of `_.isMatch` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Object} source The object of property values to match.
   * @param {Array} matchData The property names, values, and compare flags to match.
   * @param {Function} [customizer] The function to customize comparisons.
   * @returns {boolean} Returns `true` if `object` is a match, else `false`.
   */
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
      length = index,
      noCustomizer = !customizer

    if (object == null) {
      return !length
    }
    object = Object(object)
    while (index--) {
      var data = matchData[index]
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false
      }
    }
    while (++index < length) {
      data = matchData[index]
      var key = data[0],
        objValue = object[key],
        srcValue = data[1]

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false
        }
      } else {
        var stack = new Stack()
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack)
        }
        if (
          !(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
            : result)
        ) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */
  function isStrictComparable(value) {
    return value === value && !isObject(value)
  }

  /**
   * Gets the property names, values, and compare flags of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the match data of `object`.
   */
  function getMatchData(object) {
    var result = keys(object),
      length = result.length

    while (length--) {
      var key = result[length],
        value = object[key]

      result[length] = [key, value, isStrictComparable(value)]
    }
    return result
  }

  /**
   * A specialized version of `matchesProperty` for source values suitable
   * for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */
  function matchesStrictComparable(key, srcValue) {
    return function (object) {
      if (object == null) {
        return false
      }
      return object[key] === srcValue && (srcValue !== undefined || key in Object(object))
    }
  }

  /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */
  function baseMatches(source) {
    var matchData = getMatchData(source)
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1])
    }
    return function (object) {
      return object === source || baseIsMatch(object, source, matchData)
    }
  }

  /**
   * The base implementation of `_.hasIn` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHasIn(object, key) {
    return object != null && key in Object(object)
  }

  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */
  function hasPath(object, path, hasFunc) {
    path = castPath(path, object)

    var index = -1,
      length = path.length,
      result = false

    while (++index < length) {
      var key = toKey(path[index])
      if (!(result = object != null && hasFunc(object, key))) {
        break
      }
      object = object[key]
    }
    if (result || ++index != length) {
      return result
    }
    length = object == null ? 0 : object.length
    return !!length && isLength(length) && isIndex(key, length) && (isArray$1(object) || isArguments$1(object))
  }

  /**
   * Checks if `path` is a direct or inherited property of `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.hasIn(object, 'a');
   * // => true
   *
   * _.hasIn(object, 'a.b');
   * // => true
   *
   * _.hasIn(object, ['a', 'b']);
   * // => true
   *
   * _.hasIn(object, 'b');
   * // => false
   */
  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn)
  }

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2

  /**
   * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
   *
   * @private
   * @param {string} path The path of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue)
    }
    return function (object) {
      var objValue = get(object, path)
      return objValue === undefined && objValue === srcValue
        ? hasIn(object, path)
        : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG)
    }
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function baseProperty(key) {
    return function (object) {
      return object == null ? undefined : object[key]
    }
  }

  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path)
    }
  }

  /**
   * Creates a function that returns the value at `path` of a given object.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   * @example
   *
   * var objects = [
   *   { 'a': { 'b': 2 } },
   *   { 'a': { 'b': 1 } }
   * ];
   *
   * _.map(objects, _.property('a.b'));
   * // => [2, 1]
   *
   * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
   * // => [1, 2]
   */
  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path)
  }

  /**
   * The base implementation of `_.iteratee`.
   *
   * @private
   * @param {*} [value=_.identity] The value to convert to an iteratee.
   * @returns {Function} Returns the iteratee.
   */
  function baseIteratee(value) {
    // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
    // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
    if (typeof value == 'function') {
      return value
    }
    if (value == null) {
      return identity
    }
    if (typeof value == 'object') {
      return isArray$1(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value)
    }
    return property(value)
  }

  /**
   * A specialized version of `baseAggregator` for arrays.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} setter The function to set `accumulator` values.
   * @param {Function} iteratee The iteratee to transform keys.
   * @param {Object} accumulator The initial aggregated object.
   * @returns {Function} Returns `accumulator`.
   */
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
      length = array == null ? 0 : array.length

    while (++index < length) {
      var value = array[index]
      setter(accumulator, value, iteratee(value), array)
    }
    return accumulator
  }

  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function (object, iteratee, keysFunc) {
      var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length

      while (length--) {
        var key = props[fromRight ? length : ++index]
        if (iteratee(iterable[key], key, iterable) === false) {
          break
        }
      }
      return object
    }
  }

  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor()

  const baseFor$1 = baseFor

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor$1(object, iteratee, keys)
  }

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach(eachFunc, fromRight) {
    return function (collection, iteratee) {
      if (collection == null) {
        return collection
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee)
      }
      var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection)

      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break
        }
      }
      return collection
    }
  }

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
  var baseEach = createBaseEach(baseForOwn)

  const baseEach$1 = baseEach

  /**
   * Aggregates elements of `collection` on `accumulator` with keys transformed
   * by `iteratee` and values set by `setter`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} setter The function to set `accumulator` values.
   * @param {Function} iteratee The iteratee to transform keys.
   * @param {Object} accumulator The initial aggregated object.
   * @returns {Function} Returns `accumulator`.
   */
  function baseAggregator(collection, setter, iteratee, accumulator) {
    baseEach$1(collection, function (value, key, collection) {
      setter(accumulator, value, iteratee(value), collection)
    })
    return accumulator
  }

  /**
   * Creates a function like `_.groupBy`.
   *
   * @private
   * @param {Function} setter The function to set accumulator values.
   * @param {Function} [initializer] The accumulator object initializer.
   * @returns {Function} Returns the new aggregator function.
   */
  function createAggregator(setter, initializer) {
    return function (collection, iteratee) {
      var func = isArray$1(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {}

      return func(collection, setter, baseIteratee(iteratee), accumulator)
    }
  }

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$3.hasOwnProperty

  /**
   * Assigns own and inherited enumerable string keyed properties of source
   * objects to the destination object for all destination properties that
   * resolve to `undefined`. Source objects are applied from left to right.
   * Once a property is set, additional values of the same property are ignored.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.defaultsDeep
   * @example
   *
   * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
   * // => { 'a': 1, 'b': 2 }
   */
  var defaults = baseRest(function (object, sources) {
    object = Object(object)

    var index = -1
    var length = sources.length
    var guard = length > 2 ? sources[2] : undefined

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      length = 1
    }

    while (++index < length) {
      var source = sources[index]
      var props = keysIn(source)
      var propsIndex = -1
      var propsLength = props.length

      while (++propsIndex < propsLength) {
        var key = props[propsIndex]
        var value = object[key]

        if (value === undefined || (eq(value, objectProto$3[key]) && !hasOwnProperty$3.call(object, key))) {
          object[key] = source[key]
        }
      }
    }

    return object
  })

  const defaults$1 = defaults

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value)
  }

  /**
   * This function is like `arrayIncludes` except that it accepts a comparator.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
      length = array == null ? 0 : array.length

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true
      }
    }
    return false
  }

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE$1 = 200

  /**
   * The base implementation of methods like `_.difference` without support
   * for excluding multiple arrays or iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Array} values The values to exclude.
   * @param {Function} [iteratee] The iteratee invoked per element.
   * @param {Function} [comparator] The comparator invoked per element.
   * @returns {Array} Returns the new array of filtered values.
   */
  function baseDifference(array, values, iteratee, comparator) {
    var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length

    if (!length) {
      return result
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee))
    }
    if (comparator) {
      includes = arrayIncludesWith
      isCommon = false
    } else if (values.length >= LARGE_ARRAY_SIZE$1) {
      includes = cacheHas
      isCommon = false
      values = new SetCache(values)
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee == null ? value : iteratee(value)

      value = comparator || value !== 0 ? value : 0
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer
          }
        }
        result.push(value)
      } else if (!includes(values, computed, comparator)) {
        result.push(value)
      }
    }
    return result
  }

  /**
   * Creates an array of `array` values not included in the other given arrays
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons. The order and references of result values are
   * determined by the first array.
   *
   * **Note:** Unlike `_.pullAll`, this method returns a new array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {...Array} [values] The values to exclude.
   * @returns {Array} Returns the new array of filtered values.
   * @see _.without, _.xor
   * @example
   *
   * _.difference([2, 1], [2, 3]);
   * // => [1]
   */
  var difference = baseRest(function (array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : []
  })

  const difference$1 = difference

  /**
   * Gets the last element of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the last element of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   */
  function last(array) {
    var length = array == null ? 0 : array.length
    return length ? array[length - 1] : undefined
  }

  /**
   * Creates a slice of `array` with `n` elements dropped from the beginning.
   *
   * @static
   * @memberOf _
   * @since 0.5.0
   * @category Array
   * @param {Array} array The array to query.
   * @param {number} [n=1] The number of elements to drop.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Array} Returns the slice of `array`.
   * @example
   *
   * _.drop([1, 2, 3]);
   * // => [2, 3]
   *
   * _.drop([1, 2, 3], 2);
   * // => [3]
   *
   * _.drop([1, 2, 3], 5);
   * // => []
   *
   * _.drop([1, 2, 3], 0);
   * // => [1, 2, 3]
   */
  function drop(array, n, guard) {
    var length = array == null ? 0 : array.length
    if (!length) {
      return []
    }
    n = guard || n === undefined ? 1 : toInteger(n)
    return baseSlice(array, n < 0 ? 0 : n, length)
  }

  /**
   * Creates a slice of `array` with `n` elements dropped from the end.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to query.
   * @param {number} [n=1] The number of elements to drop.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Array} Returns the slice of `array`.
   * @example
   *
   * _.dropRight([1, 2, 3]);
   * // => [1, 2]
   *
   * _.dropRight([1, 2, 3], 2);
   * // => [1]
   *
   * _.dropRight([1, 2, 3], 5);
   * // => []
   *
   * _.dropRight([1, 2, 3], 0);
   * // => [1, 2, 3]
   */
  function dropRight(array, n, guard) {
    var length = array == null ? 0 : array.length
    if (!length) {
      return []
    }
    n = guard || n === undefined ? 1 : toInteger(n)
    n = length - n
    return baseSlice(array, 0, n < 0 ? 0 : n)
  }

  /**
   * Casts `value` to `identity` if it's not a function.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Function} Returns cast function.
   */
  function castFunction(value) {
    return typeof value == 'function' ? value : identity
  }

  /**
   * Iterates over elements of `collection` and invokes `iteratee` for each element.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length"
   * property are iterated like arrays. To avoid this behavior use `_.forIn`
   * or `_.forOwn` for object iteration.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias each
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   * @see _.forEachRight
   * @example
   *
   * _.forEach([1, 2], function(value) {
   *   console.log(value);
   * });
   * // => Logs `1` then `2`.
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
   *   console.log(key);
   * });
   * // => Logs 'a' then 'b' (iteration order is not guaranteed).
   */
  function forEach(collection, iteratee) {
    var func = isArray$1(collection) ? arrayEach : baseEach$1
    return func(collection, castFunction(iteratee))
  }

  /**
   * A specialized version of `_.every` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   */
  function arrayEvery(array, predicate) {
    var index = -1,
      length = array == null ? 0 : array.length

    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false
      }
    }
    return true
  }

  /**
   * The base implementation of `_.every` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`
   */
  function baseEvery(collection, predicate) {
    var result = true
    baseEach$1(collection, function (value, index, collection) {
      result = !!predicate(value, index, collection)
      return result
    })
    return result
  }

  /**
   * Checks if `predicate` returns truthy for **all** elements of `collection`.
   * Iteration is stopped once `predicate` returns falsey. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * **Note:** This method returns `true` for
   * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
   * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
   * elements of empty collections.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   * @example
   *
   * _.every([true, 1, null, 'yes'], Boolean);
   * // => false
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': false },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.every(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.every(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.every(users, 'active');
   * // => false
   */
  function every(collection, predicate, guard) {
    var func = isArray$1(collection) ? arrayEvery : baseEvery
    if (guard && isIterateeCall(collection, predicate, guard)) {
      predicate = undefined
    }
    return func(collection, baseIteratee(predicate))
  }

  /**
   * The base implementation of `_.filter` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function baseFilter(collection, predicate) {
    var result = []
    baseEach$1(collection, function (value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value)
      }
    })
    return result
  }

  /**
   * Iterates over elements of `collection`, returning an array of all elements
   * `predicate` returns truthy for. The predicate is invoked with three
   * arguments: (value, index|key, collection).
   *
   * **Note:** Unlike `_.remove`, this method returns a new array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   * @see _.reject
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * _.filter(users, function(o) { return !o.active; });
   * // => objects for ['fred']
   *
   * // The `_.matches` iteratee shorthand.
   * _.filter(users, { 'age': 36, 'active': true });
   * // => objects for ['barney']
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.filter(users, ['active', false]);
   * // => objects for ['fred']
   *
   * // The `_.property` iteratee shorthand.
   * _.filter(users, 'active');
   * // => objects for ['barney']
   *
   * // Combining several predicates using `_.overEvery` or `_.overSome`.
   * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
   * // => objects for ['fred', 'barney']
   */
  function filter(collection, predicate) {
    var func = isArray$1(collection) ? arrayFilter : baseFilter
    return func(collection, baseIteratee(predicate))
  }

  /**
   * Creates a `_.find` or `_.findLast` function.
   *
   * @private
   * @param {Function} findIndexFunc The function to find the collection index.
   * @returns {Function} Returns the new find function.
   */
  function createFind(findIndexFunc) {
    return function (collection, predicate, fromIndex) {
      var iterable = Object(collection)
      if (!isArrayLike(collection)) {
        var iteratee = baseIteratee(predicate)
        collection = keys(collection)
        predicate = function (key) {
          return iteratee(iterable[key], key, iterable)
        }
      }
      var index = findIndexFunc(collection, predicate, fromIndex)
      return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined
    }
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax$2 = Math.max

  /**
   * This method is like `_.find` except that it returns the index of the first
   * element `predicate` returns truthy for instead of the element itself.
   *
   * @static
   * @memberOf _
   * @since 1.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the found element, else `-1`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'active': false },
   *   { 'user': 'fred',    'active': false },
   *   { 'user': 'pebbles', 'active': true }
   * ];
   *
   * _.findIndex(users, function(o) { return o.user == 'barney'; });
   * // => 0
   *
   * // The `_.matches` iteratee shorthand.
   * _.findIndex(users, { 'user': 'fred', 'active': false });
   * // => 1
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.findIndex(users, ['active', false]);
   * // => 0
   *
   * // The `_.property` iteratee shorthand.
   * _.findIndex(users, 'active');
   * // => 2
   */
  function findIndex(array, predicate, fromIndex) {
    var length = array == null ? 0 : array.length
    if (!length) {
      return -1
    }
    var index = fromIndex == null ? 0 : toInteger(fromIndex)
    if (index < 0) {
      index = nativeMax$2(length + index, 0)
    }
    return baseFindIndex(array, baseIteratee(predicate), index)
  }

  /**
   * Iterates over elements of `collection`, returning the first element
   * `predicate` returns truthy for. The predicate is invoked with three
   * arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to inspect.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {*} Returns the matched element, else `undefined`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'age': 36, 'active': true },
   *   { 'user': 'fred',    'age': 40, 'active': false },
   *   { 'user': 'pebbles', 'age': 1,  'active': true }
   * ];
   *
   * _.find(users, function(o) { return o.age < 40; });
   * // => object for 'barney'
   *
   * // The `_.matches` iteratee shorthand.
   * _.find(users, { 'age': 1, 'active': true });
   * // => object for 'pebbles'
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.find(users, ['active', false]);
   * // => object for 'fred'
   *
   * // The `_.property` iteratee shorthand.
   * _.find(users, 'active');
   * // => object for 'barney'
   */
  var find = createFind(findIndex)

  const find$1 = find

  /**
   * Gets the first element of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias first
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the first element of `array`.
   * @example
   *
   * _.head([1, 2, 3]);
   * // => 1
   *
   * _.head([]);
   * // => undefined
   */
  function head(array) {
    return array && array.length ? array[0] : undefined
  }

  /**
   * The base implementation of `_.map` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function baseMap(collection, iteratee) {
    var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : []

    baseEach$1(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection)
    })
    return result
  }

  /**
   * Creates an array of values by running each element in `collection` thru
   * `iteratee`. The iteratee is invoked with three arguments:
   * (value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
   *
   * The guarded methods are:
   * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
   * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
   * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
   * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * _.map([4, 8], square);
   * // => [16, 64]
   *
   * _.map({ 'a': 4, 'b': 8 }, square);
   * // => [16, 64] (iteration order is not guaranteed)
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * // The `_.property` iteratee shorthand.
   * _.map(users, 'user');
   * // => ['barney', 'fred']
   */
  function map(collection, iteratee) {
    var func = isArray$1(collection) ? arrayMap : baseMap
    return func(collection, baseIteratee(iteratee))
  }

  /**
   * Creates a flattened array of values by running each element in `collection`
   * thru `iteratee` and flattening the mapped results. The iteratee is invoked
   * with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * function duplicate(n) {
   *   return [n, n];
   * }
   *
   * _.flatMap([1, 2], duplicate);
   * // => [1, 1, 2, 2]
   */
  function flatMap(collection, iteratee) {
    return baseFlatten(map(collection, iteratee), 1)
  }

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$2.hasOwnProperty

  /**
   * Creates an object composed of keys generated from the results of running
   * each element of `collection` thru `iteratee`. The order of grouped values
   * is determined by the order they occur in `collection`. The corresponding
   * value of each key is an array of elements responsible for generating the
   * key. The iteratee is invoked with one argument: (value).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
   * @returns {Object} Returns the composed aggregate object.
   * @example
   *
   * _.groupBy([6.1, 4.2, 6.3], Math.floor);
   * // => { '4': [4.2], '6': [6.1, 6.3] }
   *
   * // The `_.property` iteratee shorthand.
   * _.groupBy(['one', 'two', 'three'], 'length');
   * // => { '3': ['one', 'two'], '5': ['three'] }
   */
  var groupBy = createAggregator(function (result, value, key) {
    if (hasOwnProperty$2.call(result, key)) {
      result[key].push(value)
    } else {
      baseAssignValue(result, key, [value])
    }
  })

  const groupBy$1 = groupBy

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$1.hasOwnProperty

  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHas(object, key) {
    return object != null && hasOwnProperty$1.call(object, key)
  }

  /**
   * Checks if `path` is a direct property of `object`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = { 'a': { 'b': 2 } };
   * var other = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.has(object, 'a');
   * // => true
   *
   * _.has(object, 'a.b');
   * // => true
   *
   * _.has(object, ['a', 'b']);
   * // => true
   *
   * _.has(other, 'a');
   * // => false
   */
  function has(object, path) {
    return object != null && hasPath(object, path, baseHas)
  }

  /** `Object#toString` result references. */
  var stringTag = '[object String]'

  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a string, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
  function isString(value) {
    return typeof value == 'string' || (!isArray$1(value) && isObjectLike(value) && baseGetTag(value) == stringTag)
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function (key) {
      return object[key]
    })
  }

  /**
   * Creates an array of the own enumerable string keyed property values of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property values.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.values(new Foo);
   * // => [1, 2] (iteration order is not guaranteed)
   *
   * _.values('hi');
   * // => ['h', 'i']
   */
  function values(object) {
    return object == null ? [] : baseValues(object, keys(object))
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax$1 = Math.max

  /**
   * Checks if `value` is in `collection`. If `collection` is a string, it's
   * checked for a substring of `value`, otherwise
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * is used for equality comparisons. If `fromIndex` is negative, it's used as
   * the offset from the end of `collection`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object|string} collection The collection to inspect.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
   * @returns {boolean} Returns `true` if `value` is found, else `false`.
   * @example
   *
   * _.includes([1, 2, 3], 1);
   * // => true
   *
   * _.includes([1, 2, 3], 1, 2);
   * // => false
   *
   * _.includes({ 'a': 1, 'b': 2 }, 1);
   * // => true
   *
   * _.includes('abcd', 'bc');
   * // => true
   */
  function includes(collection, value, fromIndex, guard) {
    collection = isArrayLike(collection) ? collection : values(collection)
    fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0

    var length = collection.length
    if (fromIndex < 0) {
      fromIndex = nativeMax$1(length + fromIndex, 0)
    }
    return isString(collection)
      ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1
      : !!length && baseIndexOf(collection, value, fromIndex) > -1
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max

  /**
   * Gets the index at which the first occurrence of `value` is found in `array`
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons. If `fromIndex` is negative, it's used as the
   * offset from the end of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.indexOf([1, 2, 1, 2], 2);
   * // => 1
   *
   * // Search from the `fromIndex`.
   * _.indexOf([1, 2, 1, 2], 2, 2);
   * // => 3
   */
  function indexOf(array, value, fromIndex) {
    var length = array == null ? 0 : array.length
    if (!length) {
      return -1
    }
    var index = fromIndex == null ? 0 : toInteger(fromIndex)
    if (index < 0) {
      index = nativeMax(length + index, 0)
    }
    return baseIndexOf(array, value, index)
  }

  /** `Object#toString` result references. */
  var mapTag = '[object Map]',
    setTag = '[object Set]'

  /** Used for built-in method references. */
  var objectProto = Object.prototype

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty

  /**
   * Checks if `value` is an empty object, collection, map, or set.
   *
   * Objects are considered empty if they have no own enumerable string keyed
   * properties.
   *
   * Array-like values such as `arguments` objects, arrays, buffers, strings, or
   * jQuery-like collections are considered empty if they have a `length` of `0`.
   * Similarly, maps and sets are considered empty if they have a `size` of `0`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty(null);
   * // => true
   *
   * _.isEmpty(true);
   * // => true
   *
   * _.isEmpty(1);
   * // => true
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({ 'a': 1 });
   * // => false
   */
  function isEmpty(value) {
    if (value == null) {
      return true
    }
    if (
      isArrayLike(value) &&
      (isArray$1(value) ||
        typeof value == 'string' ||
        typeof value.splice == 'function' ||
        isBuffer$1(value) ||
        isTypedArray$1(value) ||
        isArguments$1(value))
    ) {
      return !value.length
    }
    var tag = getTag$1(value)
    if (tag == mapTag || tag == setTag) {
      return !value.size
    }
    if (isPrototype(value)) {
      return !baseKeys(value).length
    }
    for (var key in value) {
      if (hasOwnProperty.call(value, key)) {
        return false
      }
    }
    return true
  }

  /** `Object#toString` result references. */
  var regexpTag = '[object RegExp]'

  /**
   * The base implementation of `_.isRegExp` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   */
  function baseIsRegExp(value) {
    return isObjectLike(value) && baseGetTag(value) == regexpTag
  }

  /* Node.js helper references. */
  var nodeIsRegExp = nodeUtil$1 && nodeUtil$1.isRegExp

  /**
   * Checks if `value` is classified as a `RegExp` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   * @example
   *
   * _.isRegExp(/abc/);
   * // => true
   *
   * _.isRegExp('/abc/');
   * // => false
   */
  var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp

  const isRegExp$1 = isRegExp

  /**
   * Checks if `value` is `undefined`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
   * @example
   *
   * _.isUndefined(void 0);
   * // => true
   *
   * _.isUndefined(null);
   * // => false
   */
  function isUndefined(value) {
    return value === undefined
  }

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function'

  /**
   * Creates a function that negates the result of the predicate `func`. The
   * `func` predicate is invoked with the `this` binding and arguments of the
   * created function.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {Function} predicate The predicate to negate.
   * @returns {Function} Returns the new negated function.
   * @example
   *
   * function isEven(n) {
   *   return n % 2 == 0;
   * }
   *
   * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
   * // => [1, 3, 5]
   */
  function negate(predicate) {
    if (typeof predicate != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT)
    }
    return function () {
      var args = arguments
      switch (args.length) {
        case 0:
          return !predicate.call(this)
        case 1:
          return !predicate.call(this, args[0])
        case 2:
          return !predicate.call(this, args[0], args[1])
        case 3:
          return !predicate.call(this, args[0], args[1], args[2])
      }
      return !predicate.apply(this, args)
    }
  }

  /**
   * The base implementation of `_.set`.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {Array|string} path The path of the property to set.
   * @param {*} value The value to set.
   * @param {Function} [customizer] The function to customize path creation.
   * @returns {Object} Returns `object`.
   */
  function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
      return object
    }
    path = castPath(path, object)

    var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object

    while (nested != null && ++index < length) {
      var key = toKey(path[index]),
        newValue = value

      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return object
      }

      if (index != lastIndex) {
        var objValue = nested[key]
        newValue = customizer ? customizer(objValue, key, nested) : undefined
        if (newValue === undefined) {
          newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {}
        }
      }
      assignValue(nested, key, newValue)
      nested = nested[key]
    }
    return object
  }

  /**
   * The base implementation of  `_.pickBy` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} paths The property paths to pick.
   * @param {Function} predicate The function invoked per property.
   * @returns {Object} Returns the new object.
   */
  function basePickBy(object, paths, predicate) {
    var index = -1,
      length = paths.length,
      result = {}

    while (++index < length) {
      var path = paths[index],
        value = baseGet(object, path)

      if (predicate(value, path)) {
        baseSet(result, castPath(path, object), value)
      }
    }
    return result
  }

  /**
   * Creates an object composed of the `object` properties `predicate` returns
   * truthy for. The predicate is invoked with two arguments: (value, key).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Object
   * @param {Object} object The source object.
   * @param {Function} [predicate=_.identity] The function invoked per property.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pickBy(object, _.isNumber);
   * // => { 'a': 1, 'c': 3 }
   */
  function pickBy(object, predicate) {
    if (object == null) {
      return {}
    }
    var props = arrayMap(getAllKeysIn(object), function (prop) {
      return [prop]
    })
    predicate = baseIteratee(predicate)
    return basePickBy(object, props, function (value, path) {
      return predicate(value, path[0])
    })
  }

  /**
   * The base implementation of `_.reduce` and `_.reduceRight`, without support
   * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} accumulator The initial value.
   * @param {boolean} initAccum Specify using the first or last element of
   *  `collection` as the initial value.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the accumulated value.
   */
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function (value, index, collection) {
      accumulator = initAccum ? ((initAccum = false), value) : iteratee(accumulator, value, index, collection)
    })
    return accumulator
  }

  /**
   * Reduces `collection` to a value which is the accumulated result of running
   * each element in `collection` thru `iteratee`, where each successive
   * invocation is supplied the return value of the previous. If `accumulator`
   * is not given, the first element of `collection` is used as the initial
   * value. The iteratee is invoked with four arguments:
   * (accumulator, value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.reduce`, `_.reduceRight`, and `_.transform`.
   *
   * The guarded methods are:
   * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
   * and `sortBy`
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @returns {*} Returns the accumulated value.
   * @see _.reduceRight
   * @example
   *
   * _.reduce([1, 2], function(sum, n) {
   *   return sum + n;
   * }, 0);
   * // => 3
   *
   * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
   *   (result[value] || (result[value] = [])).push(key);
   *   return result;
   * }, {});
   * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
   */
  function reduce(collection, iteratee, accumulator) {
    var func = isArray$1(collection) ? arrayReduce : baseReduce,
      initAccum = arguments.length < 3

    return func(collection, baseIteratee(iteratee), accumulator, initAccum, baseEach$1)
  }

  /**
   * The opposite of `_.filter`; this method returns the elements of `collection`
   * that `predicate` does **not** return truthy for.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   * @see _.filter
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': false },
   *   { 'user': 'fred',   'age': 40, 'active': true }
   * ];
   *
   * _.reject(users, function(o) { return !o.active; });
   * // => objects for ['fred']
   *
   * // The `_.matches` iteratee shorthand.
   * _.reject(users, { 'age': 40, 'active': true });
   * // => objects for ['barney']
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.reject(users, ['active', false]);
   * // => objects for ['fred']
   *
   * // The `_.property` iteratee shorthand.
   * _.reject(users, 'active');
   * // => objects for ['barney']
   */
  function reject(collection, predicate) {
    var func = isArray$1(collection) ? arrayFilter : baseFilter
    return func(collection, negate(baseIteratee(predicate)))
  }

  /**
   * The base implementation of `_.some` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function baseSome(collection, predicate) {
    var result

    baseEach$1(collection, function (value, index, collection) {
      result = predicate(value, index, collection)
      return !result
    })
    return !!result
  }

  /**
   * Checks if `predicate` returns truthy for **any** element of `collection`.
   * Iteration is stopped once `predicate` returns truthy. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   * @example
   *
   * _.some([null, 0, 'yes', false], Boolean);
   * // => true
   *
   * var users = [
   *   { 'user': 'barney', 'active': true },
   *   { 'user': 'fred',   'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.some(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.some(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.some(users, 'active');
   * // => true
   */
  function some(collection, predicate, guard) {
    var func = isArray$1(collection) ? arraySome : baseSome
    if (guard && isIterateeCall(collection, predicate, guard)) {
      predicate = undefined
    }
    return func(collection, baseIteratee(predicate))
  }

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0

  /**
   * Creates a set object of `values`.
   *
   * @private
   * @param {Array} values The values to add to the set.
   * @returns {Object} Returns the new set.
   */
  var createSet = !(Set$1 && 1 / setToArray(new Set$1([, -0]))[1] == INFINITY)
    ? noop
    : function (values) {
        return new Set$1(values)
      }

  const createSet$1 = createSet

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200

  /**
   * The base implementation of `_.uniqBy` without support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The iteratee invoked per element.
   * @param {Function} [comparator] The comparator invoked per element.
   * @returns {Array} Returns the new duplicate free array.
   */
  function baseUniq(array, iteratee, comparator) {
    var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result

    if (comparator) {
      isCommon = false
      includes = arrayIncludesWith
    } else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet$1(array)
      if (set) {
        return setToArray(set)
      }
      isCommon = false
      includes = cacheHas
      seen = new SetCache()
    } else {
      seen = iteratee ? [] : result
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee ? iteratee(value) : value

      value = comparator || value !== 0 ? value : 0
      if (isCommon && computed === computed) {
        var seenIndex = seen.length
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer
          }
        }
        if (iteratee) {
          seen.push(computed)
        }
        result.push(value)
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed)
        }
        result.push(value)
      }
    }
    return result
  }

  /**
   * Creates a duplicate-free version of an array, using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons, in which only the first occurrence of each element
   * is kept. The order of result values is determined by the order they occur
   * in the array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @returns {Array} Returns the new duplicate free array.
   * @example
   *
   * _.uniq([2, 1, 2]);
   * // => [2, 1]
   */
  function uniq(array) {
    return array && array.length ? baseUniq(array) : []
  }

  function PRINT_ERROR(msg) {
    /* istanbul ignore else - can't override global.console in node.js */
    if (console && console.error) {
      console.error(`Error: ${msg}`)
    }
  }
  function PRINT_WARNING(msg) {
    /* istanbul ignore else - can't override global.console in node.js*/
    if (console && console.warn) {
      // TODO: modify docs accordingly
      console.warn(`Warning: ${msg}`)
    }
  }

  function timer(func) {
    const start = new Date().getTime()
    const val = func()
    const end = new Date().getTime()
    const total = end - start
    return { time: total, value: val }
  }

  // based on: https://github.com/petkaantonov/bluebird/blob/b97c0d2d487e8c5076e8bd897e0dcd4622d31846/src/util.js#L201-L216
  function toFastProperties(toBecomeFast) {
    function FakeConstructor() {}
    // If our object is used as a constructor, it would receive
    FakeConstructor.prototype = toBecomeFast
    const fakeInstance = new FakeConstructor()
    function fakeAccess() {
      return typeof fakeInstance.bar
    }
    // help V8 understand this is a "real" prototype by actually using
    // the fake instance.
    fakeAccess()
    fakeAccess()
    // Always true condition to suppress the Firefox warning of unreachable
    // code after a return statement.
    return toBecomeFast
  }

  // TODO: duplicated code to avoid extracting another sub-package -- how to avoid?
  function tokenLabel$1(tokType) {
    if (hasTokenLabel$1(tokType)) {
      return tokType.LABEL
    } else {
      return tokType.name
    }
  }
  // TODO: duplicated code to avoid extracting another sub-package -- how to avoid?
  function hasTokenLabel$1(obj) {
    return isString(obj.LABEL) && obj.LABEL !== ''
  }
  class AbstractProduction {
    get definition() {
      return this._definition
    }
    set definition(value) {
      this._definition = value
    }
    constructor(_definition) {
      this._definition = _definition
    }
    accept(visitor) {
      visitor.visit(this)
      forEach(this.definition, (prod) => {
        prod.accept(visitor)
      })
    }
  }
  class NonTerminal extends AbstractProduction {
    constructor(options) {
      super([])
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
    set definition(definition) {
      // immutable
    }
    get definition() {
      if (this.referencedRule !== undefined) {
        return this.referencedRule.definition
      }
      return []
    }
    accept(visitor) {
      visitor.visit(this)
      // don't visit children of a reference, we will get cyclic infinite loops if we do so
    }
  }
  class Rule extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.orgText = ''
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class Alternative extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.ignoreAmbiguities = false
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class Option extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class RepetitionMandatory extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class RepetitionMandatoryWithSeparator extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class Repetition extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class RepetitionWithSeparator extends AbstractProduction {
    constructor(options) {
      super(options.definition)
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class Alternation extends AbstractProduction {
    get definition() {
      return this._definition
    }
    set definition(value) {
      this._definition = value
    }
    constructor(options) {
      super(options.definition)
      this.idx = 1
      this.ignoreAmbiguities = false
      this.hasPredicates = false
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
  }
  class Terminal {
    constructor(options) {
      this.idx = 1
      assign$1(
        this,
        pickBy(options, (v) => v !== undefined),
      )
    }
    accept(visitor) {
      visitor.visit(this)
    }
  }
  function serializeGrammar(topRules) {
    return map(topRules, serializeProduction)
  }
  function serializeProduction(node) {
    function convertDefinition(definition) {
      return map(definition, serializeProduction)
    }
    /* istanbul ignore else */
    if (node instanceof NonTerminal) {
      const serializedNonTerminal = {
        type: 'NonTerminal',
        name: node.nonTerminalName,
        idx: node.idx,
      }
      if (isString(node.label)) {
        serializedNonTerminal.label = node.label
      }
      return serializedNonTerminal
    } else if (node instanceof Alternative) {
      return {
        type: 'Alternative',
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof Option) {
      return {
        type: 'Option',
        idx: node.idx,
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof RepetitionMandatory) {
      return {
        type: 'RepetitionMandatory',
        idx: node.idx,
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof RepetitionMandatoryWithSeparator) {
      return {
        type: 'RepetitionMandatoryWithSeparator',
        idx: node.idx,
        separator: serializeProduction(new Terminal({ terminalType: node.separator })),
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof RepetitionWithSeparator) {
      return {
        type: 'RepetitionWithSeparator',
        idx: node.idx,
        separator: serializeProduction(new Terminal({ terminalType: node.separator })),
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof Repetition) {
      return {
        type: 'Repetition',
        idx: node.idx,
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof Alternation) {
      return {
        type: 'Alternation',
        idx: node.idx,
        definition: convertDefinition(node.definition),
      }
    } else if (node instanceof Terminal) {
      const serializedTerminal = {
        type: 'Terminal',
        name: node.terminalType.name,
        label: tokenLabel$1(node.terminalType),
        idx: node.idx,
      }
      if (isString(node.label)) {
        serializedTerminal.terminalLabel = node.label
      }
      const pattern = node.terminalType.PATTERN
      if (node.terminalType.PATTERN) {
        serializedTerminal.pattern = isRegExp$1(pattern) ? pattern.source : pattern
      }
      return serializedTerminal
    } else if (node instanceof Rule) {
      return {
        type: 'Rule',
        name: node.name,
        orgText: node.orgText,
        definition: convertDefinition(node.definition),
      }
      /* c8 ignore next 3 */
    } else {
      throw Error('non exhaustive match')
    }
  }

  class GAstVisitor {
    visit(node) {
      const nodeAny = node
      switch (nodeAny.constructor) {
        case NonTerminal:
          return this.visitNonTerminal(nodeAny)
        case Alternative:
          return this.visitAlternative(nodeAny)
        case Option:
          return this.visitOption(nodeAny)
        case RepetitionMandatory:
          return this.visitRepetitionMandatory(nodeAny)
        case RepetitionMandatoryWithSeparator:
          return this.visitRepetitionMandatoryWithSeparator(nodeAny)
        case RepetitionWithSeparator:
          return this.visitRepetitionWithSeparator(nodeAny)
        case Repetition:
          return this.visitRepetition(nodeAny)
        case Alternation:
          return this.visitAlternation(nodeAny)
        case Terminal:
          return this.visitTerminal(nodeAny)
        case Rule:
          return this.visitRule(nodeAny)
        /* c8 ignore next 2 */
        default:
          throw Error('non exhaustive match')
      }
    }
    /* c8 ignore next */
    visitNonTerminal(node) {}
    /* c8 ignore next */
    visitAlternative(node) {}
    /* c8 ignore next */
    visitOption(node) {}
    /* c8 ignore next */
    visitRepetition(node) {}
    /* c8 ignore next */
    visitRepetitionMandatory(node) {}
    /* c8 ignore next 3 */
    visitRepetitionMandatoryWithSeparator(node) {}
    /* c8 ignore next */
    visitRepetitionWithSeparator(node) {}
    /* c8 ignore next */
    visitAlternation(node) {}
    /* c8 ignore next */
    visitTerminal(node) {}
    /* c8 ignore next */
    visitRule(node) {}
  }

  function isSequenceProd(prod) {
    return (
      prod instanceof Alternative ||
      prod instanceof Option ||
      prod instanceof Repetition ||
      prod instanceof RepetitionMandatory ||
      prod instanceof RepetitionMandatoryWithSeparator ||
      prod instanceof RepetitionWithSeparator ||
      prod instanceof Terminal ||
      prod instanceof Rule
    )
  }
  function isOptionalProd(prod, alreadyVisited = []) {
    const isDirectlyOptional =
      prod instanceof Option || prod instanceof Repetition || prod instanceof RepetitionWithSeparator
    if (isDirectlyOptional) {
      return true
    }
    // note that this can cause infinite loop if one optional empty TOP production has a cyclic dependency with another
    // empty optional top rule
    // may be indirectly optional ((A?B?C?) | (D?E?F?))
    if (prod instanceof Alternation) {
      // for OR its enough for just one of the alternatives to be optional
      return some(prod.definition, (subProd) => {
        return isOptionalProd(subProd, alreadyVisited)
      })
    } else if (prod instanceof NonTerminal && includes(alreadyVisited, prod)) {
      // avoiding stack overflow due to infinite recursion
      return false
    } else if (prod instanceof AbstractProduction) {
      if (prod instanceof NonTerminal) {
        alreadyVisited.push(prod)
      }
      return every(prod.definition, (subProd) => {
        return isOptionalProd(subProd, alreadyVisited)
      })
    } else {
      return false
    }
  }
  function isBranchingProd(prod) {
    return prod instanceof Alternation
  }
  function getProductionDslName(prod) {
    /* istanbul ignore else */
    if (prod instanceof NonTerminal) {
      return 'SUBRULE'
    } else if (prod instanceof Option) {
      return 'OPTION'
    } else if (prod instanceof Alternation) {
      return 'OR'
    } else if (prod instanceof RepetitionMandatory) {
      return 'AT_LEAST_ONE'
    } else if (prod instanceof RepetitionMandatoryWithSeparator) {
      return 'AT_LEAST_ONE_SEP'
    } else if (prod instanceof RepetitionWithSeparator) {
      return 'MANY_SEP'
    } else if (prod instanceof Repetition) {
      return 'MANY'
    } else if (prod instanceof Terminal) {
      return 'CONSUME'
      /* c8 ignore next 3 */
    } else {
      throw Error('non exhaustive match')
    }
  }

  /**
   *  A Grammar Walker that computes the "remaining" grammar "after" a productions in the grammar.
   */
  class RestWalker {
    walk(prod, prevRest = []) {
      forEach(prod.definition, (subProd, index) => {
        const currRest = drop(prod.definition, index + 1)
        /* istanbul ignore else */
        if (subProd instanceof NonTerminal) {
          this.walkProdRef(subProd, currRest, prevRest)
        } else if (subProd instanceof Terminal) {
          this.walkTerminal(subProd, currRest, prevRest)
        } else if (subProd instanceof Alternative) {
          this.walkFlat(subProd, currRest, prevRest)
        } else if (subProd instanceof Option) {
          this.walkOption(subProd, currRest, prevRest)
        } else if (subProd instanceof RepetitionMandatory) {
          this.walkAtLeastOne(subProd, currRest, prevRest)
        } else if (subProd instanceof RepetitionMandatoryWithSeparator) {
          this.walkAtLeastOneSep(subProd, currRest, prevRest)
        } else if (subProd instanceof RepetitionWithSeparator) {
          this.walkManySep(subProd, currRest, prevRest)
        } else if (subProd instanceof Repetition) {
          this.walkMany(subProd, currRest, prevRest)
        } else if (subProd instanceof Alternation) {
          this.walkOr(subProd, currRest, prevRest)
        } else {
          throw Error('non exhaustive match')
        }
      })
    }
    walkTerminal(terminal, currRest, prevRest) {}
    walkProdRef(refProd, currRest, prevRest) {}
    walkFlat(flatProd, currRest, prevRest) {
      // ABCDEF => after the D the rest is EF
      const fullOrRest = currRest.concat(prevRest)
      this.walk(flatProd, fullOrRest)
    }
    walkOption(optionProd, currRest, prevRest) {
      // ABC(DE)?F => after the (DE)? the rest is F
      const fullOrRest = currRest.concat(prevRest)
      this.walk(optionProd, fullOrRest)
    }
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      // ABC(DE)+F => after the (DE)+ the rest is (DE)?F
      const fullAtLeastOneRest = [new Option({ definition: atLeastOneProd.definition })].concat(currRest, prevRest)
      this.walk(atLeastOneProd, fullAtLeastOneRest)
    }
    walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
      // ABC DE(,DE)* F => after the (,DE)+ the rest is (,DE)?F
      const fullAtLeastOneSepRest = restForRepetitionWithSeparator(atLeastOneSepProd, currRest, prevRest)
      this.walk(atLeastOneSepProd, fullAtLeastOneSepRest)
    }
    walkMany(manyProd, currRest, prevRest) {
      // ABC(DE)*F => after the (DE)* the rest is (DE)?F
      const fullManyRest = [new Option({ definition: manyProd.definition })].concat(currRest, prevRest)
      this.walk(manyProd, fullManyRest)
    }
    walkManySep(manySepProd, currRest, prevRest) {
      // ABC (DE(,DE)*)? F => after the (,DE)* the rest is (,DE)?F
      const fullManySepRest = restForRepetitionWithSeparator(manySepProd, currRest, prevRest)
      this.walk(manySepProd, fullManySepRest)
    }
    walkOr(orProd, currRest, prevRest) {
      // ABC(D|E|F)G => when finding the (D|E|F) the rest is G
      const fullOrRest = currRest.concat(prevRest)
      // walk all different alternatives
      forEach(orProd.definition, (alt) => {
        // wrapping each alternative in a single definition wrapper
        // to avoid errors in computing the rest of that alternative in the invocation to computeInProdFollows
        // (otherwise for OR([alt1,alt2]) alt2 will be considered in 'rest' of alt1
        const prodWrapper = new Alternative({ definition: [alt] })
        this.walk(prodWrapper, fullOrRest)
      })
    }
  }
  function restForRepetitionWithSeparator(repSepProd, currRest, prevRest) {
    const repSepRest = [
      new Option({
        definition: [new Terminal({ terminalType: repSepProd.separator })].concat(repSepProd.definition),
      }),
    ]
    const fullRepSepRest = repSepRest.concat(currRest, prevRest)
    return fullRepSepRest
  }

  function first(prod) {
    /* istanbul ignore else */
    if (prod instanceof NonTerminal) {
      // this could in theory cause infinite loops if
      // (1) prod A refs prod B.
      // (2) prod B refs prod A
      // (3) AB can match the empty set
      // in other words a cycle where everything is optional so the first will keep
      // looking ahead for the next optional part and will never exit
      // currently there is no safeguard for this unique edge case because
      // (1) not sure a grammar in which this can happen is useful for anything (productive)
      return first(prod.referencedRule)
    } else if (prod instanceof Terminal) {
      return firstForTerminal(prod)
    } else if (isSequenceProd(prod)) {
      return firstForSequence(prod)
    } else if (isBranchingProd(prod)) {
      return firstForBranching(prod)
    } else {
      throw Error('non exhaustive match')
    }
  }
  function firstForSequence(prod) {
    let firstSet = []
    const seq = prod.definition
    let nextSubProdIdx = 0
    let hasInnerProdsRemaining = seq.length > nextSubProdIdx
    let currSubProd
    // so we enter the loop at least once (if the definition is not empty
    let isLastInnerProdOptional = true
    // scan a sequence until it's end or until we have found a NONE optional production in it
    while (hasInnerProdsRemaining && isLastInnerProdOptional) {
      currSubProd = seq[nextSubProdIdx]
      isLastInnerProdOptional = isOptionalProd(currSubProd)
      firstSet = firstSet.concat(first(currSubProd))
      nextSubProdIdx = nextSubProdIdx + 1
      hasInnerProdsRemaining = seq.length > nextSubProdIdx
    }
    return uniq(firstSet)
  }
  function firstForBranching(prod) {
    const allAlternativesFirsts = map(prod.definition, (innerProd) => {
      return first(innerProd)
    })
    return uniq(flatten(allAlternativesFirsts))
  }
  function firstForTerminal(terminal) {
    return [terminal.terminalType]
  }

  // TODO: can this be removed? where is it used?
  const IN = '_~IN~_'

  // This ResyncFollowsWalker computes all of the follows required for RESYNC
  // (skipping reference production).
  class ResyncFollowsWalker extends RestWalker {
    constructor(topProd) {
      super()
      this.topProd = topProd
      this.follows = {}
    }
    startWalking() {
      this.walk(this.topProd)
      return this.follows
    }
    walkTerminal(terminal, currRest, prevRest) {
      // do nothing! just like in the public sector after 13:00
    }
    walkProdRef(refProd, currRest, prevRest) {
      const followName = buildBetweenProdsFollowPrefix(refProd.referencedRule, refProd.idx) + this.topProd.name
      const fullRest = currRest.concat(prevRest)
      const restProd = new Alternative({ definition: fullRest })
      const t_in_topProd_follows = first(restProd)
      this.follows[followName] = t_in_topProd_follows
    }
  }
  function computeAllProdsFollows(topProductions) {
    const reSyncFollows = {}
    forEach(topProductions, (topProd) => {
      const currRefsFollow = new ResyncFollowsWalker(topProd).startWalking()
      assign$1(reSyncFollows, currRefsFollow)
    })
    return reSyncFollows
  }
  function buildBetweenProdsFollowPrefix(inner, occurenceInParent) {
    return inner.name + occurenceInParent + IN
  }

  function cc(char) {
    return char.charCodeAt(0)
  }
  function insertToSet(item, set) {
    if (Array.isArray(item)) {
      item.forEach(function (subItem) {
        set.push(subItem)
      })
    } else {
      set.push(item)
    }
  }
  function addFlag(flagObj, flagKey) {
    if (flagObj[flagKey] === true) {
      throw 'duplicate flag ' + flagKey
    }
    flagObj[flagKey]
    flagObj[flagKey] = true
  }
  function ASSERT_EXISTS(obj) {
    // istanbul ignore next
    if (obj === undefined) {
      throw Error('Internal Error - Should never get here!')
    }
    return true
  }
  // istanbul ignore next
  function ASSERT_NEVER_REACH_HERE() {
    throw Error('Internal Error - Should never get here!')
  }
  function isCharacter(obj) {
    return obj['type'] === 'Character'
  }

  const digitsCharCodes = []
  for (let i = cc('0'); i <= cc('9'); i++) {
    digitsCharCodes.push(i)
  }
  const wordCharCodes = [cc('_')].concat(digitsCharCodes)
  for (let i = cc('a'); i <= cc('z'); i++) {
    wordCharCodes.push(i)
  }
  for (let i = cc('A'); i <= cc('Z'); i++) {
    wordCharCodes.push(i)
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#character-classes
  const whitespaceCodes = [
    cc(' '),
    cc('\f'),
    cc('\n'),
    cc('\r'),
    cc('\t'),
    cc('\v'),
    cc('\t'),
    cc('\u00a0'),
    cc('\u1680'),
    cc('\u2000'),
    cc('\u2001'),
    cc('\u2002'),
    cc('\u2003'),
    cc('\u2004'),
    cc('\u2005'),
    cc('\u2006'),
    cc('\u2007'),
    cc('\u2008'),
    cc('\u2009'),
    cc('\u200a'),
    cc('\u2028'),
    cc('\u2029'),
    cc('\u202f'),
    cc('\u205f'),
    cc('\u3000'),
    cc('\ufeff'),
  ]

  // consts and utilities
  const hexDigitPattern = /[0-9a-fA-F]/
  const decimalPattern = /[0-9]/
  const decimalPatternNoZero = /[1-9]/
  // https://hackernoon.com/the-madness-of-parsing-real-world-javascript-regexps-d9ee336df983
  // https://www.ecma-international.org/ecma-262/8.0/index.html#prod-Pattern
  class RegExpParser {
    constructor() {
      this.idx = 0
      this.input = ''
      this.groupIdx = 0
    }
    saveState() {
      return {
        idx: this.idx,
        input: this.input,
        groupIdx: this.groupIdx,
      }
    }
    restoreState(newState) {
      this.idx = newState.idx
      this.input = newState.input
      this.groupIdx = newState.groupIdx
    }
    pattern(input) {
      // parser state
      this.idx = 0
      this.input = input
      this.groupIdx = 0
      this.consumeChar('/')
      const value = this.disjunction()
      this.consumeChar('/')
      const flags = {
        type: 'Flags',
        loc: { begin: this.idx, end: input.length },
        global: false,
        ignoreCase: false,
        multiLine: false,
        unicode: false,
        sticky: false,
      }
      while (this.isRegExpFlag()) {
        switch (this.popChar()) {
          case 'g':
            addFlag(flags, 'global')
            break
          case 'i':
            addFlag(flags, 'ignoreCase')
            break
          case 'm':
            addFlag(flags, 'multiLine')
            break
          case 'u':
            addFlag(flags, 'unicode')
            break
          case 'y':
            addFlag(flags, 'sticky')
            break
        }
      }
      if (this.idx !== this.input.length) {
        throw Error('Redundant input: ' + this.input.substring(this.idx))
      }
      return {
        type: 'Pattern',
        flags: flags,
        value: value,
        loc: this.loc(0),
      }
    }
    disjunction() {
      const alts = []
      const begin = this.idx
      alts.push(this.alternative())
      while (this.peekChar() === '|') {
        this.consumeChar('|')
        alts.push(this.alternative())
      }
      return { type: 'Disjunction', value: alts, loc: this.loc(begin) }
    }
    alternative() {
      const terms = []
      const begin = this.idx
      while (this.isTerm()) {
        terms.push(this.term())
      }
      return { type: 'Alternative', value: terms, loc: this.loc(begin) }
    }
    term() {
      if (this.isAssertion()) {
        return this.assertion()
      } else {
        return this.atom()
      }
    }
    assertion() {
      const begin = this.idx
      switch (this.popChar()) {
        case '^':
          return {
            type: 'StartAnchor',
            loc: this.loc(begin),
          }
        case '$':
          return { type: 'EndAnchor', loc: this.loc(begin) }
        // '\b' or '\B'
        case '\\':
          switch (this.popChar()) {
            case 'b':
              return {
                type: 'WordBoundary',
                loc: this.loc(begin),
              }
            case 'B':
              return {
                type: 'NonWordBoundary',
                loc: this.loc(begin),
              }
          }
          // istanbul ignore next
          throw Error('Invalid Assertion Escape')
        // '(?=' or '(?!'
        case '(':
          this.consumeChar('?')
          let type
          switch (this.popChar()) {
            case '=':
              type = 'Lookahead'
              break
            case '!':
              type = 'NegativeLookahead'
              break
          }
          ASSERT_EXISTS(type)
          const disjunction = this.disjunction()
          this.consumeChar(')')
          return {
            type: type,
            value: disjunction,
            loc: this.loc(begin),
          }
      }
      // istanbul ignore next
      return ASSERT_NEVER_REACH_HERE()
    }
    quantifier(isBacktracking = false) {
      let range = undefined
      const begin = this.idx
      switch (this.popChar()) {
        case '*':
          range = {
            atLeast: 0,
            atMost: Infinity,
          }
          break
        case '+':
          range = {
            atLeast: 1,
            atMost: Infinity,
          }
          break
        case '?':
          range = {
            atLeast: 0,
            atMost: 1,
          }
          break
        case '{':
          const atLeast = this.integerIncludingZero()
          switch (this.popChar()) {
            case '}':
              range = {
                atLeast: atLeast,
                atMost: atLeast,
              }
              break
            case ',':
              let atMost
              if (this.isDigit()) {
                atMost = this.integerIncludingZero()
                range = {
                  atLeast: atLeast,
                  atMost: atMost,
                }
              } else {
                range = {
                  atLeast: atLeast,
                  atMost: Infinity,
                }
              }
              this.consumeChar('}')
              break
          }
          // throwing exceptions from "ASSERT_EXISTS" during backtracking
          // causes severe performance degradations
          if (isBacktracking === true && range === undefined) {
            return undefined
          }
          ASSERT_EXISTS(range)
          break
      }
      // throwing exceptions from "ASSERT_EXISTS" during backtracking
      // causes severe performance degradations
      if (isBacktracking === true && range === undefined) {
        return undefined
      }
      // istanbul ignore else
      if (ASSERT_EXISTS(range)) {
        if (this.peekChar(0) === '?') {
          this.consumeChar('?')
          range.greedy = false
        } else {
          range.greedy = true
        }
        range.type = 'Quantifier'
        range.loc = this.loc(begin)
        return range
      }
    }
    atom() {
      let atom
      const begin = this.idx
      switch (this.peekChar()) {
        case '.':
          atom = this.dotAll()
          break
        case '\\':
          atom = this.atomEscape()
          break
        case '[':
          atom = this.characterClass()
          break
        case '(':
          atom = this.group()
          break
      }
      if (atom === undefined && this.isPatternCharacter()) {
        atom = this.patternCharacter()
      }
      // istanbul ignore else
      if (ASSERT_EXISTS(atom)) {
        atom.loc = this.loc(begin)
        if (this.isQuantifier()) {
          atom.quantifier = this.quantifier()
        }
        return atom
      }
    }
    dotAll() {
      this.consumeChar('.')
      return {
        type: 'Set',
        complement: true,
        value: [cc('\n'), cc('\r'), cc('\u2028'), cc('\u2029')],
      }
    }
    atomEscape() {
      this.consumeChar('\\')
      switch (this.peekChar()) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return this.decimalEscapeAtom()
        case 'd':
        case 'D':
        case 's':
        case 'S':
        case 'w':
        case 'W':
          return this.characterClassEscape()
        case 'f':
        case 'n':
        case 'r':
        case 't':
        case 'v':
          return this.controlEscapeAtom()
        case 'c':
          return this.controlLetterEscapeAtom()
        case '0':
          return this.nulCharacterAtom()
        case 'x':
          return this.hexEscapeSequenceAtom()
        case 'u':
          return this.regExpUnicodeEscapeSequenceAtom()
        default:
          return this.identityEscapeAtom()
      }
    }
    decimalEscapeAtom() {
      const value = this.positiveInteger()
      return { type: 'GroupBackReference', value: value }
    }
    characterClassEscape() {
      let set
      let complement = false
      switch (this.popChar()) {
        case 'd':
          set = digitsCharCodes
          break
        case 'D':
          set = digitsCharCodes
          complement = true
          break
        case 's':
          set = whitespaceCodes
          break
        case 'S':
          set = whitespaceCodes
          complement = true
          break
        case 'w':
          set = wordCharCodes
          break
        case 'W':
          set = wordCharCodes
          complement = true
          break
      }
      // istanbul ignore else
      if (ASSERT_EXISTS(set)) {
        return { type: 'Set', value: set, complement: complement }
      }
    }
    controlEscapeAtom() {
      let escapeCode
      switch (this.popChar()) {
        case 'f':
          escapeCode = cc('\f')
          break
        case 'n':
          escapeCode = cc('\n')
          break
        case 'r':
          escapeCode = cc('\r')
          break
        case 't':
          escapeCode = cc('\t')
          break
        case 'v':
          escapeCode = cc('\v')
          break
      }
      // istanbul ignore else
      if (ASSERT_EXISTS(escapeCode)) {
        return { type: 'Character', value: escapeCode }
      }
    }
    controlLetterEscapeAtom() {
      this.consumeChar('c')
      const letter = this.popChar()
      if (/[a-zA-Z]/.test(letter) === false) {
        throw Error('Invalid ')
      }
      const letterCode = letter.toUpperCase().charCodeAt(0) - 64
      return { type: 'Character', value: letterCode }
    }
    nulCharacterAtom() {
      // TODO implement '[lookahead ∉ DecimalDigit]'
      // TODO: for the deprecated octal escape sequence
      this.consumeChar('0')
      return { type: 'Character', value: cc('\0') }
    }
    hexEscapeSequenceAtom() {
      this.consumeChar('x')
      return this.parseHexDigits(2)
    }
    regExpUnicodeEscapeSequenceAtom() {
      this.consumeChar('u')
      return this.parseHexDigits(4)
    }
    identityEscapeAtom() {
      // TODO: implement "SourceCharacter but not UnicodeIDContinue"
      // // http://unicode.org/reports/tr31/#Specific_Character_Adjustments
      const escapedChar = this.popChar()
      return { type: 'Character', value: cc(escapedChar) }
    }
    classPatternCharacterAtom() {
      switch (this.peekChar()) {
        // istanbul ignore next
        case '\n':
        // istanbul ignore next
        case '\r':
        // istanbul ignore next
        case '\u2028':
        // istanbul ignore next
        case '\u2029':
        // istanbul ignore next
        case '\\':
        // istanbul ignore next
        case ']':
          throw Error('TBD')
        default:
          const nextChar = this.popChar()
          return { type: 'Character', value: cc(nextChar) }
      }
    }
    characterClass() {
      const set = []
      let complement = false
      this.consumeChar('[')
      if (this.peekChar(0) === '^') {
        this.consumeChar('^')
        complement = true
      }
      while (this.isClassAtom()) {
        const from = this.classAtom()
        from.type === 'Character'
        if (isCharacter(from) && this.isRangeDash()) {
          this.consumeChar('-')
          const to = this.classAtom()
          to.type === 'Character'
          // a range can only be used when both sides are single characters
          if (isCharacter(to)) {
            if (to.value < from.value) {
              throw Error('Range out of order in character class')
            }
            set.push({ from: from.value, to: to.value })
          } else {
            // literal dash
            insertToSet(from.value, set)
            set.push(cc('-'))
            insertToSet(to.value, set)
          }
        } else {
          insertToSet(from.value, set)
        }
      }
      this.consumeChar(']')
      return { type: 'Set', complement: complement, value: set }
    }
    classAtom() {
      switch (this.peekChar()) {
        // istanbul ignore next
        case ']':
        // istanbul ignore next
        case '\n':
        // istanbul ignore next
        case '\r':
        // istanbul ignore next
        case '\u2028':
        // istanbul ignore next
        case '\u2029':
          throw Error('TBD')
        case '\\':
          return this.classEscape()
        default:
          return this.classPatternCharacterAtom()
      }
    }
    classEscape() {
      this.consumeChar('\\')
      switch (this.peekChar()) {
        // Matches a backspace.
        // (Not to be confused with \b word boundary outside characterClass)
        case 'b':
          this.consumeChar('b')
          return { type: 'Character', value: cc('\u0008') }
        case 'd':
        case 'D':
        case 's':
        case 'S':
        case 'w':
        case 'W':
          return this.characterClassEscape()
        case 'f':
        case 'n':
        case 'r':
        case 't':
        case 'v':
          return this.controlEscapeAtom()
        case 'c':
          return this.controlLetterEscapeAtom()
        case '0':
          return this.nulCharacterAtom()
        case 'x':
          return this.hexEscapeSequenceAtom()
        case 'u':
          return this.regExpUnicodeEscapeSequenceAtom()
        default:
          return this.identityEscapeAtom()
      }
    }
    group() {
      let capturing = true
      this.consumeChar('(')
      switch (this.peekChar(0)) {
        case '?':
          this.consumeChar('?')
          this.consumeChar(':')
          capturing = false
          break
        default:
          this.groupIdx++
          break
      }
      const value = this.disjunction()
      this.consumeChar(')')
      const groupAst = {
        type: 'Group',
        capturing: capturing,
        value: value,
      }
      if (capturing) {
        groupAst['idx'] = this.groupIdx
      }
      return groupAst
    }
    positiveInteger() {
      let number = this.popChar()
      // istanbul ignore next - can't ever get here due to previous lookahead checks
      // still implementing this error checking in case this ever changes.
      if (decimalPatternNoZero.test(number) === false) {
        throw Error('Expecting a positive integer')
      }
      while (decimalPattern.test(this.peekChar(0))) {
        number += this.popChar()
      }
      return parseInt(number, 10)
    }
    integerIncludingZero() {
      let number = this.popChar()
      if (decimalPattern.test(number) === false) {
        throw Error('Expecting an integer')
      }
      while (decimalPattern.test(this.peekChar(0))) {
        number += this.popChar()
      }
      return parseInt(number, 10)
    }
    patternCharacter() {
      const nextChar = this.popChar()
      switch (nextChar) {
        // istanbul ignore next
        case '\n':
        // istanbul ignore next
        case '\r':
        // istanbul ignore next
        case '\u2028':
        // istanbul ignore next
        case '\u2029':
        // istanbul ignore next
        case '^':
        // istanbul ignore next
        case '$':
        // istanbul ignore next
        case '\\':
        // istanbul ignore next
        case '.':
        // istanbul ignore next
        case '*':
        // istanbul ignore next
        case '+':
        // istanbul ignore next
        case '?':
        // istanbul ignore next
        case '(':
        // istanbul ignore next
        case ')':
        // istanbul ignore next
        case '[':
        // istanbul ignore next
        case '|':
          // istanbul ignore next
          throw Error('TBD')
        default:
          return { type: 'Character', value: cc(nextChar) }
      }
    }
    isRegExpFlag() {
      switch (this.peekChar(0)) {
        case 'g':
        case 'i':
        case 'm':
        case 'u':
        case 'y':
          return true
        default:
          return false
      }
    }
    isRangeDash() {
      return this.peekChar() === '-' && this.isClassAtom(1)
    }
    isDigit() {
      return decimalPattern.test(this.peekChar(0))
    }
    isClassAtom(howMuch = 0) {
      switch (this.peekChar(howMuch)) {
        case ']':
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          return false
        default:
          return true
      }
    }
    isTerm() {
      return this.isAtom() || this.isAssertion()
    }
    isAtom() {
      if (this.isPatternCharacter()) {
        return true
      }
      switch (this.peekChar(0)) {
        case '.':
        case '\\': // atomEscape
        case '[': // characterClass
        // TODO: isAtom must be called before isAssertion - disambiguate
        case '(': // group
          return true
        default:
          return false
      }
    }
    isAssertion() {
      switch (this.peekChar(0)) {
        case '^':
        case '$':
          return true
        // '\b' or '\B'
        case '\\':
          switch (this.peekChar(1)) {
            case 'b':
            case 'B':
              return true
            default:
              return false
          }
        // '(?=' or '(?!'
        case '(':
          return this.peekChar(1) === '?' && (this.peekChar(2) === '=' || this.peekChar(2) === '!')
        default:
          return false
      }
    }
    isQuantifier() {
      const prevState = this.saveState()
      try {
        return this.quantifier(true) !== undefined
      } catch (e) {
        return false
      } finally {
        this.restoreState(prevState)
      }
    }
    isPatternCharacter() {
      switch (this.peekChar()) {
        case '^':
        case '$':
        case '\\':
        case '.':
        case '*':
        case '+':
        case '?':
        case '(':
        case ')':
        case '[':
        case '|':
        case '/':
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          return false
        default:
          return true
      }
    }
    parseHexDigits(howMany) {
      let hexString = ''
      for (let i = 0; i < howMany; i++) {
        const hexChar = this.popChar()
        if (hexDigitPattern.test(hexChar) === false) {
          throw Error('Expecting a HexDecimal digits')
        }
        hexString += hexChar
      }
      const charCode = parseInt(hexString, 16)
      return { type: 'Character', value: charCode }
    }
    peekChar(howMuch = 0) {
      return this.input[this.idx + howMuch]
    }
    popChar() {
      const nextChar = this.peekChar(0)
      this.consumeChar(undefined)
      return nextChar
    }
    consumeChar(char) {
      if (char !== undefined && this.input[this.idx] !== char) {
        throw Error("Expected: '" + char + "' but found: '" + this.input[this.idx] + "' at offset: " + this.idx)
      }
      if (this.idx >= this.input.length) {
        throw Error('Unexpected end of input')
      }
      this.idx++
    }
    loc(begin) {
      return { begin: begin, end: this.idx }
    }
  }

  class BaseRegExpVisitor {
    visitChildren(node) {
      for (const key in node) {
        const child = node[key]
        /* istanbul ignore else */
        if (node.hasOwnProperty(key)) {
          if (child.type !== undefined) {
            this.visit(child)
          } else if (Array.isArray(child)) {
            child.forEach((subChild) => {
              this.visit(subChild)
            }, this)
          }
        }
      }
    }
    visit(node) {
      switch (node.type) {
        case 'Pattern':
          this.visitPattern(node)
          break
        case 'Flags':
          this.visitFlags(node)
          break
        case 'Disjunction':
          this.visitDisjunction(node)
          break
        case 'Alternative':
          this.visitAlternative(node)
          break
        case 'StartAnchor':
          this.visitStartAnchor(node)
          break
        case 'EndAnchor':
          this.visitEndAnchor(node)
          break
        case 'WordBoundary':
          this.visitWordBoundary(node)
          break
        case 'NonWordBoundary':
          this.visitNonWordBoundary(node)
          break
        case 'Lookahead':
          this.visitLookahead(node)
          break
        case 'NegativeLookahead':
          this.visitNegativeLookahead(node)
          break
        case 'Character':
          this.visitCharacter(node)
          break
        case 'Set':
          this.visitSet(node)
          break
        case 'Group':
          this.visitGroup(node)
          break
        case 'GroupBackReference':
          this.visitGroupBackReference(node)
          break
        case 'Quantifier':
          this.visitQuantifier(node)
          break
      }
      this.visitChildren(node)
    }
    visitPattern(node) {}
    visitFlags(node) {}
    visitDisjunction(node) {}
    visitAlternative(node) {}
    // Assertion
    visitStartAnchor(node) {}
    visitEndAnchor(node) {}
    visitWordBoundary(node) {}
    visitNonWordBoundary(node) {}
    visitLookahead(node) {}
    visitNegativeLookahead(node) {}
    // atoms
    visitCharacter(node) {}
    visitSet(node) {}
    visitGroup(node) {}
    visitGroupBackReference(node) {}
    visitQuantifier(node) {}
  }

  let regExpAstCache = {}
  const regExpParser = new RegExpParser()
  function getRegExpAst(regExp) {
    const regExpStr = regExp.toString()
    if (regExpAstCache.hasOwnProperty(regExpStr)) {
      return regExpAstCache[regExpStr]
    } else {
      const regExpAst = regExpParser.pattern(regExpStr)
      regExpAstCache[regExpStr] = regExpAst
      return regExpAst
    }
  }
  function clearRegExpParserCache() {
    regExpAstCache = {}
  }

  const complementErrorMessage = 'Complement Sets are not supported for first char optimization'
  const failedOptimizationPrefixMsg = 'Unable to use "first char" lexer optimizations:\n'
  function getOptimizedStartCodesIndices(regExp, ensureOptimizations = false) {
    try {
      const ast = getRegExpAst(regExp)
      const firstChars = firstCharOptimizedIndices(ast.value, {}, ast.flags.ignoreCase)
      return firstChars
    } catch (e) {
      /* istanbul ignore next */
      // Testing this relies on the regexp-to-ast library having a bug... */
      // TODO: only the else branch needs to be ignored, try to fix with newer prettier / tsc
      if (e.message === complementErrorMessage) {
        if (ensureOptimizations) {
          PRINT_WARNING(
            `${failedOptimizationPrefixMsg}` +
              `\tUnable to optimize: < ${regExp.toString()} >\n` +
              '\tComplement Sets cannot be automatically optimized.\n' +
              "\tThis will disable the lexer's first char optimizations.\n" +
              '\tSee: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#COMPLEMENT for details.',
          )
        }
      } else {
        let msgSuffix = ''
        if (ensureOptimizations) {
          msgSuffix =
            "\n\tThis will disable the lexer's first char optimizations.\n" +
            '\tSee: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#REGEXP_PARSING for details.'
        }
        PRINT_ERROR(
          `${failedOptimizationPrefixMsg}\n` +
            `\tFailed parsing: < ${regExp.toString()} >\n` +
            `\tUsing the @chevrotain/regexp-to-ast library\n` +
            '\tPlease open an issue at: https://github.com/chevrotain/chevrotain/issues' +
            msgSuffix,
        )
      }
    }
    return []
  }
  function firstCharOptimizedIndices(ast, result, ignoreCase) {
    switch (ast.type) {
      case 'Disjunction':
        for (let i = 0; i < ast.value.length; i++) {
          firstCharOptimizedIndices(ast.value[i], result, ignoreCase)
        }
        break
      case 'Alternative':
        const terms = ast.value
        for (let i = 0; i < terms.length; i++) {
          const term = terms[i]
          // skip terms that cannot effect the first char results
          switch (term.type) {
            case 'EndAnchor':
            // A group back reference cannot affect potential starting char.
            // because if a back reference is the first production than automatically
            // the group being referenced has had to come BEFORE so its codes have already been added
            case 'GroupBackReference':
            // assertions do not affect potential starting codes
            case 'Lookahead':
            case 'NegativeLookahead':
            case 'StartAnchor':
            case 'WordBoundary':
            case 'NonWordBoundary':
              continue
          }
          const atom = term
          switch (atom.type) {
            case 'Character':
              addOptimizedIdxToResult(atom.value, result, ignoreCase)
              break
            case 'Set':
              if (atom.complement === true) {
                throw Error(complementErrorMessage)
              }
              forEach(atom.value, (code) => {
                if (typeof code === 'number') {
                  addOptimizedIdxToResult(code, result, ignoreCase)
                } else {
                  // range
                  const range = code
                  // cannot optimize when ignoreCase is
                  if (ignoreCase === true) {
                    for (let rangeCode = range.from; rangeCode <= range.to; rangeCode++) {
                      addOptimizedIdxToResult(rangeCode, result, ignoreCase)
                    }
                  }
                  // Optimization (2 orders of magnitude less work for very large ranges)
                  else {
                    // handle unoptimized values
                    for (
                      let rangeCode = range.from;
                      rangeCode <= range.to && rangeCode < minOptimizationVal;
                      rangeCode++
                    ) {
                      addOptimizedIdxToResult(rangeCode, result, ignoreCase)
                    }
                    // Less common charCode where we optimize for faster init time, by using larger "buckets"
                    if (range.to >= minOptimizationVal) {
                      const minUnOptVal = range.from >= minOptimizationVal ? range.from : minOptimizationVal
                      const maxUnOptVal = range.to
                      const minOptIdx = charCodeToOptimizedIndex(minUnOptVal)
                      const maxOptIdx = charCodeToOptimizedIndex(maxUnOptVal)
                      for (let currOptIdx = minOptIdx; currOptIdx <= maxOptIdx; currOptIdx++) {
                        result[currOptIdx] = currOptIdx
                      }
                    }
                  }
                }
              })
              break
            case 'Group':
              firstCharOptimizedIndices(atom.value, result, ignoreCase)
              break
            /* istanbul ignore next */
            default:
              throw Error('Non Exhaustive Match')
          }
          // reached a mandatory production, no more **start** codes can be found on this alternative
          const isOptionalQuantifier = atom.quantifier !== undefined && atom.quantifier.atLeast === 0
          if (
            // A group may be optional due to empty contents /(?:)/
            // or if everything inside it is optional /((a)?)/
            (atom.type === 'Group' && isWholeOptional(atom) === false) ||
            // If this term is not a group it may only be optional if it has an optional quantifier
            (atom.type !== 'Group' && isOptionalQuantifier === false)
          ) {
            break
          }
        }
        break
      /* istanbul ignore next */
      default:
        throw Error('non exhaustive match!')
    }
    // console.log(Object.keys(result).length)
    return values(result)
  }
  function addOptimizedIdxToResult(code, result, ignoreCase) {
    const optimizedCharIdx = charCodeToOptimizedIndex(code)
    result[optimizedCharIdx] = optimizedCharIdx
    if (ignoreCase === true) {
      handleIgnoreCase(code, result)
    }
  }
  function handleIgnoreCase(code, result) {
    const char = String.fromCharCode(code)
    const upperChar = char.toUpperCase()
    /* istanbul ignore else */
    if (upperChar !== char) {
      const optimizedCharIdx = charCodeToOptimizedIndex(upperChar.charCodeAt(0))
      result[optimizedCharIdx] = optimizedCharIdx
    } else {
      const lowerChar = char.toLowerCase()
      if (lowerChar !== char) {
        const optimizedCharIdx = charCodeToOptimizedIndex(lowerChar.charCodeAt(0))
        result[optimizedCharIdx] = optimizedCharIdx
      }
    }
  }
  function findCode(setNode, targetCharCodes) {
    return find$1(setNode.value, (codeOrRange) => {
      if (typeof codeOrRange === 'number') {
        return includes(targetCharCodes, codeOrRange)
      } else {
        // range
        const range = codeOrRange
        return find$1(targetCharCodes, (targetCode) => range.from <= targetCode && targetCode <= range.to) !== undefined
      }
    })
  }
  function isWholeOptional(ast) {
    const quantifier = ast.quantifier
    if (quantifier && quantifier.atLeast === 0) {
      return true
    }
    if (!ast.value) {
      return false
    }
    return isArray$1(ast.value) ? every(ast.value, isWholeOptional) : isWholeOptional(ast.value)
  }
  class CharCodeFinder extends BaseRegExpVisitor {
    constructor(targetCharCodes) {
      super()
      this.targetCharCodes = targetCharCodes
      this.found = false
    }
    visitChildren(node) {
      // No need to keep looking...
      if (this.found === true) {
        return
      }
      // switch lookaheads as they do not actually consume any characters thus
      // finding a charCode at lookahead context does not mean that regexp can actually contain it in a match.
      switch (node.type) {
        case 'Lookahead':
          this.visitLookahead(node)
          return
        case 'NegativeLookahead':
          this.visitNegativeLookahead(node)
          return
      }
      super.visitChildren(node)
    }
    visitCharacter(node) {
      if (includes(this.targetCharCodes, node.value)) {
        this.found = true
      }
    }
    visitSet(node) {
      if (node.complement) {
        if (findCode(node, this.targetCharCodes) === undefined) {
          this.found = true
        }
      } else {
        if (findCode(node, this.targetCharCodes) !== undefined) {
          this.found = true
        }
      }
    }
  }
  function canMatchCharCode(charCodes, pattern) {
    if (pattern instanceof RegExp) {
      const ast = getRegExpAst(pattern)
      const charCodeFinder = new CharCodeFinder(charCodes)
      charCodeFinder.visit(ast)
      return charCodeFinder.found
    } else {
      return (
        find$1(pattern, (char) => {
          return includes(charCodes, char.charCodeAt(0))
        }) !== undefined
      )
    }
  }

  const PATTERN = 'PATTERN'
  const DEFAULT_MODE = 'defaultMode'
  const MODES = 'modes'
  let SUPPORT_STICKY = typeof new RegExp('(?:)').sticky === 'boolean'
  function analyzeTokenTypes(tokenTypes, options) {
    options = defaults$1(options, {
      useSticky: SUPPORT_STICKY,
      debug: false,
      safeMode: false,
      positionTracking: 'full',
      lineTerminatorCharacters: ['\r', '\n'],
      tracer: (msg, action) => action(),
    })
    const tracer = options.tracer
    tracer('initCharCodeToOptimizedIndexMap', () => {
      initCharCodeToOptimizedIndexMap()
    })
    let onlyRelevantTypes
    tracer('Reject Lexer.NA', () => {
      onlyRelevantTypes = reject(tokenTypes, (currType) => {
        return currType[PATTERN] === Lexer.NA
      })
    })
    let hasCustom = false
    let allTransformedPatterns
    tracer('Transform Patterns', () => {
      hasCustom = false
      allTransformedPatterns = map(onlyRelevantTypes, (currType) => {
        const currPattern = currType[PATTERN]
        /* istanbul ignore else */
        if (isRegExp$1(currPattern)) {
          const regExpSource = currPattern.source
          if (
            regExpSource.length === 1 &&
            // only these regExp meta characters which can appear in a length one regExp
            regExpSource !== '^' &&
            regExpSource !== '$' &&
            regExpSource !== '.' &&
            !currPattern.ignoreCase
          ) {
            return regExpSource
          } else if (
            regExpSource.length === 2 &&
            regExpSource[0] === '\\' &&
            // not a meta character
            !includes(['d', 'D', 's', 'S', 't', 'r', 'n', 't', '0', 'c', 'b', 'B', 'f', 'v', 'w', 'W'], regExpSource[1])
          ) {
            // escaped meta Characters: /\+/ /\[/
            // or redundant escaping: /\a/
            // without the escaping "\"
            return regExpSource[1]
          } else {
            return options.useSticky ? addStickyFlag(currPattern) : addStartOfInput(currPattern)
          }
        } else if (isFunction(currPattern)) {
          hasCustom = true
          // CustomPatternMatcherFunc - custom patterns do not require any transformations, only wrapping in a RegExp Like object
          return { exec: currPattern }
        } else if (typeof currPattern === 'object') {
          hasCustom = true
          // ICustomPattern
          return currPattern
        } else if (typeof currPattern === 'string') {
          if (currPattern.length === 1) {
            return currPattern
          } else {
            const escapedRegExpString = currPattern.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
            const wrappedRegExp = new RegExp(escapedRegExpString)
            return options.useSticky ? addStickyFlag(wrappedRegExp) : addStartOfInput(wrappedRegExp)
          }
        } else {
          throw Error('non exhaustive match')
        }
      })
    })
    let patternIdxToType
    let patternIdxToGroup
    let patternIdxToLongerAltIdxArr
    let patternIdxToPushMode
    let patternIdxToPopMode
    tracer('misc mapping', () => {
      patternIdxToType = map(onlyRelevantTypes, (currType) => currType.tokenTypeIdx)
      patternIdxToGroup = map(onlyRelevantTypes, (clazz) => {
        const groupName = clazz.GROUP
        /* istanbul ignore next */
        if (groupName === Lexer.SKIPPED) {
          return undefined
        } else if (isString(groupName)) {
          return groupName
        } else if (isUndefined(groupName)) {
          return false
        } else {
          throw Error('non exhaustive match')
        }
      })
      patternIdxToLongerAltIdxArr = map(onlyRelevantTypes, (clazz) => {
        const longerAltType = clazz.LONGER_ALT
        if (longerAltType) {
          const longerAltIdxArr = isArray$1(longerAltType)
            ? map(longerAltType, (type) => indexOf(onlyRelevantTypes, type))
            : [indexOf(onlyRelevantTypes, longerAltType)]
          return longerAltIdxArr
        }
      })
      patternIdxToPushMode = map(onlyRelevantTypes, (clazz) => clazz.PUSH_MODE)
      patternIdxToPopMode = map(onlyRelevantTypes, (clazz) => has(clazz, 'POP_MODE'))
    })
    let patternIdxToCanLineTerminator
    tracer('Line Terminator Handling', () => {
      const lineTerminatorCharCodes = getCharCodes(options.lineTerminatorCharacters)
      patternIdxToCanLineTerminator = map(onlyRelevantTypes, (tokType) => false)
      if (options.positionTracking !== 'onlyOffset') {
        patternIdxToCanLineTerminator = map(onlyRelevantTypes, (tokType) => {
          if (has(tokType, 'LINE_BREAKS')) {
            return !!tokType.LINE_BREAKS
          } else {
            return (
              checkLineBreaksIssues(tokType, lineTerminatorCharCodes) === false &&
              canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN)
            )
          }
        })
      }
    })
    let patternIdxToIsCustom
    let patternIdxToShort
    let emptyGroups
    let patternIdxToConfig
    tracer('Misc Mapping #2', () => {
      patternIdxToIsCustom = map(onlyRelevantTypes, isCustomPattern)
      patternIdxToShort = map(allTransformedPatterns, isShortPattern)
      emptyGroups = reduce(
        onlyRelevantTypes,
        (acc, clazz) => {
          const groupName = clazz.GROUP
          if (isString(groupName) && !(groupName === Lexer.SKIPPED)) {
            acc[groupName] = []
          }
          return acc
        },
        {},
      )
      patternIdxToConfig = map(allTransformedPatterns, (x, idx) => {
        return {
          pattern: allTransformedPatterns[idx],
          longerAlt: patternIdxToLongerAltIdxArr[idx],
          canLineTerminator: patternIdxToCanLineTerminator[idx],
          isCustom: patternIdxToIsCustom[idx],
          short: patternIdxToShort[idx],
          group: patternIdxToGroup[idx],
          push: patternIdxToPushMode[idx],
          pop: patternIdxToPopMode[idx],
          tokenTypeIdx: patternIdxToType[idx],
          tokenType: onlyRelevantTypes[idx],
        }
      })
    })
    let canBeOptimized = true
    let charCodeToPatternIdxToConfig = []
    if (!options.safeMode) {
      tracer('First Char Optimization', () => {
        charCodeToPatternIdxToConfig = reduce(
          onlyRelevantTypes,
          (result, currTokType, idx) => {
            if (typeof currTokType.PATTERN === 'string') {
              const charCode = currTokType.PATTERN.charCodeAt(0)
              const optimizedIdx = charCodeToOptimizedIndex(charCode)
              addToMapOfArrays(result, optimizedIdx, patternIdxToConfig[idx])
            } else if (isArray$1(currTokType.START_CHARS_HINT)) {
              let lastOptimizedIdx
              forEach(currTokType.START_CHARS_HINT, (charOrInt) => {
                const charCode = typeof charOrInt === 'string' ? charOrInt.charCodeAt(0) : charOrInt
                const currOptimizedIdx = charCodeToOptimizedIndex(charCode)
                // Avoid adding the config multiple times
                /* istanbul ignore else */
                // - Difficult to check this scenario effects as it is only a performance
                //   optimization that does not change correctness
                if (lastOptimizedIdx !== currOptimizedIdx) {
                  lastOptimizedIdx = currOptimizedIdx
                  addToMapOfArrays(result, currOptimizedIdx, patternIdxToConfig[idx])
                }
              })
            } else if (isRegExp$1(currTokType.PATTERN)) {
              if (currTokType.PATTERN.unicode) {
                canBeOptimized = false
                if (options.ensureOptimizations) {
                  PRINT_ERROR(
                    `${failedOptimizationPrefixMsg}` +
                      `\tUnable to analyze < ${currTokType.PATTERN.toString()} > pattern.\n` +
                      '\tThe regexp unicode flag is not currently supported by the regexp-to-ast library.\n' +
                      "\tThis will disable the lexer's first char optimizations.\n" +
                      '\tFor details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNICODE_OPTIMIZE',
                  )
                }
              } else {
                const optimizedCodes = getOptimizedStartCodesIndices(currTokType.PATTERN, options.ensureOptimizations)
                /* istanbul ignore if */
                // start code will only be empty given an empty regExp or failure of regexp-to-ast library
                // the first should be a different validation and the second cannot be tested.
                if (isEmpty(optimizedCodes)) {
                  // we cannot understand what codes may start possible matches
                  // The optimization correctness requires knowing start codes for ALL patterns.
                  // Not actually sure this is an error, no debug message
                  canBeOptimized = false
                }
                forEach(optimizedCodes, (code) => {
                  addToMapOfArrays(result, code, patternIdxToConfig[idx])
                })
              }
            } else {
              if (options.ensureOptimizations) {
                PRINT_ERROR(
                  `${failedOptimizationPrefixMsg}` +
                    `\tTokenType: <${currTokType.name}> is using a custom token pattern without providing <start_chars_hint> parameter.\n` +
                    "\tThis will disable the lexer's first char optimizations.\n" +
                    '\tFor details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE',
                )
              }
              canBeOptimized = false
            }
            return result
          },
          [],
        )
      })
    }
    return {
      emptyGroups: emptyGroups,
      patternIdxToConfig: patternIdxToConfig,
      charCodeToPatternIdxToConfig: charCodeToPatternIdxToConfig,
      hasCustom: hasCustom,
      canBeOptimized: canBeOptimized,
    }
  }
  function validatePatterns(tokenTypes, validModesNames) {
    let errors = []
    const missingResult = findMissingPatterns(tokenTypes)
    errors = errors.concat(missingResult.errors)
    const invalidResult = findInvalidPatterns(missingResult.valid)
    const validTokenTypes = invalidResult.valid
    errors = errors.concat(invalidResult.errors)
    errors = errors.concat(validateRegExpPattern(validTokenTypes))
    errors = errors.concat(findInvalidGroupType(validTokenTypes))
    errors = errors.concat(findModesThatDoNotExist(validTokenTypes, validModesNames))
    errors = errors.concat(findUnreachablePatterns(validTokenTypes))
    return errors
  }
  function validateRegExpPattern(tokenTypes) {
    let errors = []
    const withRegExpPatterns = filter(tokenTypes, (currTokType) => isRegExp$1(currTokType[PATTERN]))
    errors = errors.concat(findEndOfInputAnchor(withRegExpPatterns))
    errors = errors.concat(findStartOfInputAnchor(withRegExpPatterns))
    errors = errors.concat(findUnsupportedFlags(withRegExpPatterns))
    errors = errors.concat(findDuplicatePatterns(withRegExpPatterns))
    errors = errors.concat(findEmptyMatchRegExps(withRegExpPatterns))
    return errors
  }
  function findMissingPatterns(tokenTypes) {
    const tokenTypesWithMissingPattern = filter(tokenTypes, (currType) => {
      return !has(currType, PATTERN)
    })
    const errors = map(tokenTypesWithMissingPattern, (currType) => {
      return {
        message: 'Token Type: ->' + currType.name + "<- missing static 'PATTERN' property",
        type: LexerDefinitionErrorType.MISSING_PATTERN,
        tokenTypes: [currType],
      }
    })
    const valid = difference$1(tokenTypes, tokenTypesWithMissingPattern)
    return { errors, valid }
  }
  function findInvalidPatterns(tokenTypes) {
    const tokenTypesWithInvalidPattern = filter(tokenTypes, (currType) => {
      const pattern = currType[PATTERN]
      return !isRegExp$1(pattern) && !isFunction(pattern) && !has(pattern, 'exec') && !isString(pattern)
    })
    const errors = map(tokenTypesWithInvalidPattern, (currType) => {
      return {
        message:
          'Token Type: ->' +
          currType.name +
          "<- static 'PATTERN' can only be a RegExp, a" +
          ' Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.',
        type: LexerDefinitionErrorType.INVALID_PATTERN,
        tokenTypes: [currType],
      }
    })
    const valid = difference$1(tokenTypes, tokenTypesWithInvalidPattern)
    return { errors, valid }
  }
  const end_of_input = /[^\\][$]/
  function findEndOfInputAnchor(tokenTypes) {
    class EndAnchorFinder extends BaseRegExpVisitor {
      constructor() {
        super(...arguments)
        this.found = false
      }
      visitEndAnchor(node) {
        this.found = true
      }
    }
    const invalidRegex = filter(tokenTypes, (currType) => {
      const pattern = currType.PATTERN
      try {
        const regexpAst = getRegExpAst(pattern)
        const endAnchorVisitor = new EndAnchorFinder()
        endAnchorVisitor.visit(regexpAst)
        return endAnchorVisitor.found
      } catch (e) {
        // old behavior in case of runtime exceptions with regexp-to-ast.
        /* istanbul ignore next - cannot ensure an error in regexp-to-ast*/
        return end_of_input.test(pattern.source)
      }
    })
    const errors = map(invalidRegex, (currType) => {
      return {
        message:
          'Unexpected RegExp Anchor Error:\n' +
          '\tToken Type: ->' +
          currType.name +
          "<- static 'PATTERN' cannot contain end of input anchor '$'\n" +
          '\tSee chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS' +
          '\tfor details.',
        type: LexerDefinitionErrorType.EOI_ANCHOR_FOUND,
        tokenTypes: [currType],
      }
    })
    return errors
  }
  function findEmptyMatchRegExps(tokenTypes) {
    const matchesEmptyString = filter(tokenTypes, (currType) => {
      const pattern = currType.PATTERN
      return pattern.test('')
    })
    const errors = map(matchesEmptyString, (currType) => {
      return {
        message: 'Token Type: ->' + currType.name + "<- static 'PATTERN' must not match an empty string",
        type: LexerDefinitionErrorType.EMPTY_MATCH_PATTERN,
        tokenTypes: [currType],
      }
    })
    return errors
  }
  const start_of_input = /[^\\[][\^]|^\^/
  function findStartOfInputAnchor(tokenTypes) {
    class StartAnchorFinder extends BaseRegExpVisitor {
      constructor() {
        super(...arguments)
        this.found = false
      }
      visitStartAnchor(node) {
        this.found = true
      }
    }
    const invalidRegex = filter(tokenTypes, (currType) => {
      const pattern = currType.PATTERN
      try {
        const regexpAst = getRegExpAst(pattern)
        const startAnchorVisitor = new StartAnchorFinder()
        startAnchorVisitor.visit(regexpAst)
        return startAnchorVisitor.found
      } catch (e) {
        // old behavior in case of runtime exceptions with regexp-to-ast.
        /* istanbul ignore next - cannot ensure an error in regexp-to-ast*/
        return start_of_input.test(pattern.source)
      }
    })
    const errors = map(invalidRegex, (currType) => {
      return {
        message:
          'Unexpected RegExp Anchor Error:\n' +
          '\tToken Type: ->' +
          currType.name +
          "<- static 'PATTERN' cannot contain start of input anchor '^'\n" +
          '\tSee https://chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS' +
          '\tfor details.',
        type: LexerDefinitionErrorType.SOI_ANCHOR_FOUND,
        tokenTypes: [currType],
      }
    })
    return errors
  }
  function findUnsupportedFlags(tokenTypes) {
    const invalidFlags = filter(tokenTypes, (currType) => {
      const pattern = currType[PATTERN]
      return pattern instanceof RegExp && (pattern.multiline || pattern.global)
    })
    const errors = map(invalidFlags, (currType) => {
      return {
        message: 'Token Type: ->' + currType.name + "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
        type: LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND,
        tokenTypes: [currType],
      }
    })
    return errors
  }
  // This can only test for identical duplicate RegExps, not semantically equivalent ones.
  function findDuplicatePatterns(tokenTypes) {
    const found = []
    let identicalPatterns = map(tokenTypes, (outerType) => {
      return reduce(
        tokenTypes,
        (result, innerType) => {
          if (
            outerType.PATTERN.source === innerType.PATTERN.source &&
            !includes(found, innerType) &&
            innerType.PATTERN !== Lexer.NA
          ) {
            // this avoids duplicates in the result, each Token Type may only appear in one "set"
            // in essence we are creating Equivalence classes on equality relation.
            found.push(innerType)
            result.push(innerType)
            return result
          }
          return result
        },
        [],
      )
    })
    identicalPatterns = compact(identicalPatterns)
    const duplicatePatterns = filter(identicalPatterns, (currIdenticalSet) => {
      return currIdenticalSet.length > 1
    })
    const errors = map(duplicatePatterns, (setOfIdentical) => {
      const tokenTypeNames = map(setOfIdentical, (currType) => {
        return currType.name
      })
      const dupPatternSrc = head(setOfIdentical).PATTERN
      return {
        message:
          `The same RegExp pattern ->${dupPatternSrc}<-` +
          `has been used in all of the following Token Types: ${tokenTypeNames.join(', ')} <-`,
        type: LexerDefinitionErrorType.DUPLICATE_PATTERNS_FOUND,
        tokenTypes: setOfIdentical,
      }
    })
    return errors
  }
  function findInvalidGroupType(tokenTypes) {
    const invalidTypes = filter(tokenTypes, (clazz) => {
      if (!has(clazz, 'GROUP')) {
        return false
      }
      const group = clazz.GROUP
      return group !== Lexer.SKIPPED && group !== Lexer.NA && !isString(group)
    })
    const errors = map(invalidTypes, (currType) => {
      return {
        message: 'Token Type: ->' + currType.name + "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
        type: LexerDefinitionErrorType.INVALID_GROUP_TYPE_FOUND,
        tokenTypes: [currType],
      }
    })
    return errors
  }
  function findModesThatDoNotExist(tokenTypes, validModes) {
    const invalidModes = filter(tokenTypes, (clazz) => {
      return clazz.PUSH_MODE !== undefined && !includes(validModes, clazz.PUSH_MODE)
    })
    const errors = map(invalidModes, (tokType) => {
      const msg =
        `Token Type: ->${tokType.name}<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->${tokType.PUSH_MODE}<-` +
        `which does not exist`
      return {
        message: msg,
        type: LexerDefinitionErrorType.PUSH_MODE_DOES_NOT_EXIST,
        tokenTypes: [tokType],
      }
    })
    return errors
  }
  function findUnreachablePatterns(tokenTypes) {
    const errors = []
    const canBeTested = reduce(
      tokenTypes,
      (result, tokType, idx) => {
        const pattern = tokType.PATTERN
        if (pattern === Lexer.NA) {
          return result
        }
        // a more comprehensive validation for all forms of regExps would require
        // deeper regExp analysis capabilities
        if (isString(pattern)) {
          result.push({ str: pattern, idx, tokenType: tokType })
        } else if (isRegExp$1(pattern) && noMetaChar(pattern)) {
          result.push({ str: pattern.source, idx, tokenType: tokType })
        }
        return result
      },
      [],
    )
    forEach(tokenTypes, (tokType, testIdx) => {
      forEach(canBeTested, ({ str, idx, tokenType }) => {
        if (testIdx < idx && testTokenType(str, tokType.PATTERN)) {
          const msg =
            `Token: ->${tokenType.name}<- can never be matched.\n` +
            `Because it appears AFTER the Token Type ->${tokType.name}<-` +
            `in the lexer's definition.\n` +
            `See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE`
          errors.push({
            message: msg,
            type: LexerDefinitionErrorType.UNREACHABLE_PATTERN,
            tokenTypes: [tokType, tokenType],
          })
        }
      })
    })
    return errors
  }
  function testTokenType(str, pattern) {
    /* istanbul ignore else */
    if (isRegExp$1(pattern)) {
      const regExpArray = pattern.exec(str)
      return regExpArray !== null && regExpArray.index === 0
    } else if (isFunction(pattern)) {
      // maintain the API of custom patterns
      return pattern(str, 0, [], {})
    } else if (has(pattern, 'exec')) {
      // maintain the API of custom patterns
      return pattern.exec(str, 0, [], {})
    } else if (typeof pattern === 'string') {
      return pattern === str
    } else {
      throw Error('non exhaustive match')
    }
  }
  function noMetaChar(regExp) {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const metaChars = ['.', '\\', '[', ']', '|', '^', '$', '(', ')', '?', '*', '+', '{']
    return find$1(metaChars, (char) => regExp.source.indexOf(char) !== -1) === undefined
  }
  function addStartOfInput(pattern) {
    const flags = pattern.ignoreCase ? 'i' : ''
    // always wrapping in a none capturing group preceded by '^' to make sure matching can only work on start of input.
    // duplicate/redundant start of input markers have no meaning (/^^^^A/ === /^A/)
    return new RegExp(`^(?:${pattern.source})`, flags)
  }
  function addStickyFlag(pattern) {
    const flags = pattern.ignoreCase ? 'iy' : 'y'
    // always wrapping in a none capturing group preceded by '^' to make sure matching can only work on start of input.
    // duplicate/redundant start of input markers have no meaning (/^^^^A/ === /^A/)
    return new RegExp(`${pattern.source}`, flags)
  }
  function performRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
    const errors = []
    // some run time checks to help the end users.
    if (!has(lexerDefinition, DEFAULT_MODE)) {
      errors.push({
        message:
          'A MultiMode Lexer cannot be initialized without a <' + DEFAULT_MODE + '> property in its definition\n',
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE,
      })
    }
    if (!has(lexerDefinition, MODES)) {
      errors.push({
        message: 'A MultiMode Lexer cannot be initialized without a <' + MODES + '> property in its definition\n',
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY,
      })
    }
    if (
      has(lexerDefinition, MODES) &&
      has(lexerDefinition, DEFAULT_MODE) &&
      !has(lexerDefinition.modes, lexerDefinition.defaultMode)
    ) {
      errors.push({
        message:
          `A MultiMode Lexer cannot be initialized with a ${DEFAULT_MODE}: <${lexerDefinition.defaultMode}>` +
          `which does not exist\n`,
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST,
      })
    }
    if (has(lexerDefinition, MODES)) {
      forEach(lexerDefinition.modes, (currModeValue, currModeName) => {
        forEach(currModeValue, (currTokType, currIdx) => {
          if (isUndefined(currTokType)) {
            errors.push({
              message:
                `A Lexer cannot be initialized using an undefined Token Type. Mode:` +
                `<${currModeName}> at index: <${currIdx}>\n`,
              type: LexerDefinitionErrorType.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED,
            })
          } else if (has(currTokType, 'LONGER_ALT')) {
            const longerAlt = isArray$1(currTokType.LONGER_ALT) ? currTokType.LONGER_ALT : [currTokType.LONGER_ALT]
            forEach(longerAlt, (currLongerAlt) => {
              if (!isUndefined(currLongerAlt) && !includes(currModeValue, currLongerAlt)) {
                errors.push({
                  message: `A MultiMode Lexer cannot be initialized with a longer_alt <${currLongerAlt.name}> on token <${currTokType.name}> outside of mode <${currModeName}>\n`,
                  type: LexerDefinitionErrorType.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE,
                })
              }
            })
          }
        })
      })
    }
    return errors
  }
  function performWarningRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
    const warnings = []
    let hasAnyLineBreak = false
    const allTokenTypes = compact(flatten(values(lexerDefinition.modes)))
    const concreteTokenTypes = reject(allTokenTypes, (currType) => currType[PATTERN] === Lexer.NA)
    const terminatorCharCodes = getCharCodes(lineTerminatorCharacters)
    if (trackLines) {
      forEach(concreteTokenTypes, (tokType) => {
        const currIssue = checkLineBreaksIssues(tokType, terminatorCharCodes)
        if (currIssue !== false) {
          const message = buildLineBreakIssueMessage(tokType, currIssue)
          const warningDescriptor = {
            message,
            type: currIssue.issue,
            tokenType: tokType,
          }
          warnings.push(warningDescriptor)
        } else {
          // we don't want to attempt to scan if the user explicitly specified the line_breaks option.
          if (has(tokType, 'LINE_BREAKS')) {
            if (tokType.LINE_BREAKS === true) {
              hasAnyLineBreak = true
            }
          } else {
            if (canMatchCharCode(terminatorCharCodes, tokType.PATTERN)) {
              hasAnyLineBreak = true
            }
          }
        }
      })
    }
    if (trackLines && !hasAnyLineBreak) {
      warnings.push({
        message:
          'Warning: No LINE_BREAKS Found.\n' +
          '\tThis Lexer has been defined to track line and column information,\n' +
          '\tBut none of the Token Types can be identified as matching a line terminator.\n' +
          '\tSee https://chevrotain.io/docs/guide/resolving_lexer_errors.html#LINE_BREAKS \n' +
          '\tfor details.',
        type: LexerDefinitionErrorType.NO_LINE_BREAKS_FLAGS,
      })
    }
    return warnings
  }
  function cloneEmptyGroups(emptyGroups) {
    const clonedResult = {}
    const groupKeys = keys(emptyGroups)
    forEach(groupKeys, (currKey) => {
      const currGroupValue = emptyGroups[currKey]
      /* istanbul ignore else */
      if (isArray$1(currGroupValue)) {
        clonedResult[currKey] = []
      } else {
        throw Error('non exhaustive match')
      }
    })
    return clonedResult
  }
  // TODO: refactor to avoid duplication
  function isCustomPattern(tokenType) {
    const pattern = tokenType.PATTERN
    /* istanbul ignore else */
    if (isRegExp$1(pattern)) {
      return false
    } else if (isFunction(pattern)) {
      // CustomPatternMatcherFunc - custom patterns do not require any transformations, only wrapping in a RegExp Like object
      return true
    } else if (has(pattern, 'exec')) {
      // ICustomPattern
      return true
    } else if (isString(pattern)) {
      return false
    } else {
      throw Error('non exhaustive match')
    }
  }
  function isShortPattern(pattern) {
    if (isString(pattern) && pattern.length === 1) {
      return pattern.charCodeAt(0)
    } else {
      return false
    }
  }
  /**
   * Faster than using a RegExp for default newline detection during lexing.
   */
  const LineTerminatorOptimizedTester = {
    // implements /\n|\r\n?/g.test
    test: function (text) {
      const len = text.length
      for (let i = this.lastIndex; i < len; i++) {
        const c = text.charCodeAt(i)
        if (c === 10) {
          this.lastIndex = i + 1
          return true
        } else if (c === 13) {
          if (text.charCodeAt(i + 1) === 10) {
            this.lastIndex = i + 2
          } else {
            this.lastIndex = i + 1
          }
          return true
        }
      }
      return false
    },
    lastIndex: 0,
  }
  function checkLineBreaksIssues(tokType, lineTerminatorCharCodes) {
    if (has(tokType, 'LINE_BREAKS')) {
      // if the user explicitly declared the line_breaks option we will respect their choice
      // and assume it is correct.
      return false
    } else {
      /* istanbul ignore else */
      if (isRegExp$1(tokType.PATTERN)) {
        try {
          // TODO: why is the casting suddenly needed?
          canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN)
        } catch (e) {
          /* istanbul ignore next - to test this we would have to mock <canMatchCharCode> to throw an error */
          return {
            issue: LexerDefinitionErrorType.IDENTIFY_TERMINATOR,
            errMsg: e.message,
          }
        }
        return false
      } else if (isString(tokType.PATTERN)) {
        // string literal patterns can always be analyzed to detect line terminator usage
        return false
      } else if (isCustomPattern(tokType)) {
        // custom token types
        return { issue: LexerDefinitionErrorType.CUSTOM_LINE_BREAK }
      } else {
        throw Error('non exhaustive match')
      }
    }
  }
  function buildLineBreakIssueMessage(tokType, details) {
    /* istanbul ignore else */
    if (details.issue === LexerDefinitionErrorType.IDENTIFY_TERMINATOR) {
      return (
        'Warning: unable to identify line terminator usage in pattern.\n' +
        `\tThe problem is in the <${tokType.name}> Token Type\n` +
        `\t Root cause: ${details.errMsg}.\n` +
        '\tFor details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#IDENTIFY_TERMINATOR'
      )
    } else if (details.issue === LexerDefinitionErrorType.CUSTOM_LINE_BREAK) {
      return (
        'Warning: A Custom Token Pattern should specify the <line_breaks> option.\n' +
        `\tThe problem is in the <${tokType.name}> Token Type\n` +
        '\tFor details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_LINE_BREAK'
      )
    } else {
      throw Error('non exhaustive match')
    }
  }
  function getCharCodes(charsOrCodes) {
    const charCodes = map(charsOrCodes, (numOrString) => {
      if (isString(numOrString)) {
        return numOrString.charCodeAt(0)
      } else {
        return numOrString
      }
    })
    return charCodes
  }
  function addToMapOfArrays(map, key, value) {
    if (map[key] === undefined) {
      map[key] = [value]
    } else {
      map[key].push(value)
    }
  }
  const minOptimizationVal = 256
  /**
   * We are mapping charCode above ASCI (256) into buckets each in the size of 256.
   * This is because ASCI are the most common start chars so each one of those will get its own
   * possible token configs vector.
   *
   * Tokens starting with charCodes "above" ASCI are uncommon, so we can "afford"
   * to place these into buckets of possible token configs, What we gain from
   * this is avoiding the case of creating an optimization 'charCodeToPatternIdxToConfig'
   * which would contain 10,000+ arrays of small size (e.g unicode Identifiers scenario).
   * Our 'charCodeToPatternIdxToConfig' max size will now be:
   * 256 + (2^16 / 2^8) - 1 === 511
   *
   * note the hack for fast division integer part extraction
   * See: https://stackoverflow.com/a/4228528
   */
  let charCodeToOptimizedIdxMap = []
  function charCodeToOptimizedIndex(charCode) {
    return charCode < minOptimizationVal ? charCode : charCodeToOptimizedIdxMap[charCode]
  }
  /**
   * This is a compromise between cold start / hot running performance
   * Creating this array takes ~3ms on a modern machine,
   * But if we perform the computation at runtime as needed the CSS Lexer benchmark
   * performance degrades by ~10%
   *
   * TODO: Perhaps it should be lazy initialized only if a charCode > 255 is used.
   */
  function initCharCodeToOptimizedIndexMap() {
    if (isEmpty(charCodeToOptimizedIdxMap)) {
      charCodeToOptimizedIdxMap = new Array(65536)
      for (let i = 0; i < 65536; i++) {
        charCodeToOptimizedIdxMap[i] = i > 255 ? 255 + ~~(i / 255) : i
      }
    }
  }

  function tokenStructuredMatcher(tokInstance, tokConstructor) {
    const instanceType = tokInstance.tokenTypeIdx
    if (instanceType === tokConstructor.tokenTypeIdx) {
      return true
    } else {
      return tokConstructor.isParent === true && tokConstructor.categoryMatchesMap[instanceType] === true
    }
  }
  // Optimized tokenMatcher in case our grammar does not use token categories
  // Being so tiny it is much more likely to be in-lined and this avoid the function call overhead
  function tokenStructuredMatcherNoCategories(token, tokType) {
    return token.tokenTypeIdx === tokType.tokenTypeIdx
  }
  let tokenShortNameIdx = 1
  const tokenIdxToClass = {}
  function augmentTokenTypes(tokenTypes) {
    // collect the parent Token Types as well.
    const tokenTypesAndParents = expandCategories(tokenTypes)
    // add required tokenType and categoryMatches properties
    assignTokenDefaultProps(tokenTypesAndParents)
    // fill up the categoryMatches
    assignCategoriesMapProp(tokenTypesAndParents)
    assignCategoriesTokensProp(tokenTypesAndParents)
    forEach(tokenTypesAndParents, (tokType) => {
      tokType.isParent = tokType.categoryMatches.length > 0
    })
  }
  function expandCategories(tokenTypes) {
    let result = clone(tokenTypes)
    let categories = tokenTypes
    let searching = true
    while (searching) {
      categories = compact(flatten(map(categories, (currTokType) => currTokType.CATEGORIES)))
      const newCategories = difference$1(categories, result)
      result = result.concat(newCategories)
      if (isEmpty(newCategories)) {
        searching = false
      } else {
        categories = newCategories
      }
    }
    return result
  }
  function assignTokenDefaultProps(tokenTypes) {
    forEach(tokenTypes, (currTokType) => {
      if (!hasShortKeyProperty(currTokType)) {
        tokenIdxToClass[tokenShortNameIdx] = currTokType
        currTokType.tokenTypeIdx = tokenShortNameIdx++
      }
      // CATEGORIES? : TokenType | TokenType[]
      if (
        hasCategoriesProperty(currTokType) &&
        !isArray$1(currTokType.CATEGORIES)
        // &&
        // !isUndefined(currTokType.CATEGORIES.PATTERN)
      ) {
        currTokType.CATEGORIES = [currTokType.CATEGORIES]
      }
      if (!hasCategoriesProperty(currTokType)) {
        currTokType.CATEGORIES = []
      }
      if (!hasExtendingTokensTypesProperty(currTokType)) {
        currTokType.categoryMatches = []
      }
      if (!hasExtendingTokensTypesMapProperty(currTokType)) {
        currTokType.categoryMatchesMap = {}
      }
    })
  }
  function assignCategoriesTokensProp(tokenTypes) {
    forEach(tokenTypes, (currTokType) => {
      // avoid duplications
      currTokType.categoryMatches = []
      forEach(currTokType.categoryMatchesMap, (val, key) => {
        currTokType.categoryMatches.push(tokenIdxToClass[key].tokenTypeIdx)
      })
    })
  }
  function assignCategoriesMapProp(tokenTypes) {
    forEach(tokenTypes, (currTokType) => {
      singleAssignCategoriesToksMap([], currTokType)
    })
  }
  function singleAssignCategoriesToksMap(path, nextNode) {
    forEach(path, (pathNode) => {
      nextNode.categoryMatchesMap[pathNode.tokenTypeIdx] = true
    })
    forEach(nextNode.CATEGORIES, (nextCategory) => {
      const newPath = path.concat(nextNode)
      // avoids infinite loops due to cyclic categories.
      if (!includes(newPath, nextCategory)) {
        singleAssignCategoriesToksMap(newPath, nextCategory)
      }
    })
  }
  function hasShortKeyProperty(tokType) {
    return has(tokType, 'tokenTypeIdx')
  }
  function hasCategoriesProperty(tokType) {
    return has(tokType, 'CATEGORIES')
  }
  function hasExtendingTokensTypesProperty(tokType) {
    return has(tokType, 'categoryMatches')
  }
  function hasExtendingTokensTypesMapProperty(tokType) {
    return has(tokType, 'categoryMatchesMap')
  }
  function isTokenType(tokType) {
    return has(tokType, 'tokenTypeIdx')
  }

  const defaultLexerErrorProvider = {
    buildUnableToPopLexerModeMessage(token) {
      return `Unable to pop Lexer Mode after encountering Token ->${token.image}<- The Mode Stack is empty`
    },
    buildUnexpectedCharactersMessage(fullText, startOffset, length, line, column) {
      return (
        `unexpected character: ->${fullText.charAt(startOffset)}<- at offset: ${startOffset},` +
        ` skipped ${length} characters.`
      )
    },
  }

  var LexerDefinitionErrorType
  ;(function (LexerDefinitionErrorType) {
    LexerDefinitionErrorType[(LexerDefinitionErrorType['MISSING_PATTERN'] = 0)] = 'MISSING_PATTERN'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['INVALID_PATTERN'] = 1)] = 'INVALID_PATTERN'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['EOI_ANCHOR_FOUND'] = 2)] = 'EOI_ANCHOR_FOUND'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['UNSUPPORTED_FLAGS_FOUND'] = 3)] = 'UNSUPPORTED_FLAGS_FOUND'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['DUPLICATE_PATTERNS_FOUND'] = 4)] = 'DUPLICATE_PATTERNS_FOUND'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['INVALID_GROUP_TYPE_FOUND'] = 5)] = 'INVALID_GROUP_TYPE_FOUND'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['PUSH_MODE_DOES_NOT_EXIST'] = 6)] = 'PUSH_MODE_DOES_NOT_EXIST'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE'] = 7)] =
      'MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY'] = 8)] =
      'MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST'] = 9)] =
      'MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED'] = 10)] =
      'LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['SOI_ANCHOR_FOUND'] = 11)] = 'SOI_ANCHOR_FOUND'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['EMPTY_MATCH_PATTERN'] = 12)] = 'EMPTY_MATCH_PATTERN'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['NO_LINE_BREAKS_FLAGS'] = 13)] = 'NO_LINE_BREAKS_FLAGS'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['UNREACHABLE_PATTERN'] = 14)] = 'UNREACHABLE_PATTERN'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['IDENTIFY_TERMINATOR'] = 15)] = 'IDENTIFY_TERMINATOR'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['CUSTOM_LINE_BREAK'] = 16)] = 'CUSTOM_LINE_BREAK'
    LexerDefinitionErrorType[(LexerDefinitionErrorType['MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE'] = 17)] =
      'MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE'
  })(LexerDefinitionErrorType || (LexerDefinitionErrorType = {}))
  const DEFAULT_LEXER_CONFIG = {
    deferDefinitionErrorsHandling: false,
    positionTracking: 'full',
    lineTerminatorsPattern: /\n|\r\n?/g,
    lineTerminatorCharacters: ['\n', '\r'],
    ensureOptimizations: false,
    safeMode: false,
    errorMessageProvider: defaultLexerErrorProvider,
    traceInitPerf: false,
    skipValidations: false,
    recoveryEnabled: true,
  }
  Object.freeze(DEFAULT_LEXER_CONFIG)
  class Lexer {
    constructor(lexerDefinition, config = DEFAULT_LEXER_CONFIG) {
      this.lexerDefinition = lexerDefinition
      this.lexerDefinitionErrors = []
      this.lexerDefinitionWarning = []
      this.patternIdxToConfig = {}
      this.charCodeToPatternIdxToConfig = {}
      this.modes = []
      this.emptyGroups = {}
      this.trackStartLines = true
      this.trackEndLines = true
      this.hasCustom = false
      this.canModeBeOptimized = {}
      // Duplicated from the parser's perf trace trait to allow future extraction
      // of the lexer to a separate package.
      this.TRACE_INIT = (phaseDesc, phaseImpl) => {
        // No need to optimize this using NOOP pattern because
        // It is not called in a hot spot...
        if (this.traceInitPerf === true) {
          this.traceInitIndent++
          const indent = new Array(this.traceInitIndent + 1).join('\t')
          if (this.traceInitIndent < this.traceInitMaxIdent) {
            console.log(`${indent}--> <${phaseDesc}>`)
          }
          const { time, value } = timer(phaseImpl)
          /* istanbul ignore next - Difficult to reproduce specific performance behavior (>10ms) in tests */
          const traceMethod = time > 10 ? console.warn : console.log
          if (this.traceInitIndent < this.traceInitMaxIdent) {
            traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`)
          }
          this.traceInitIndent--
          return value
        } else {
          return phaseImpl()
        }
      }
      if (typeof config === 'boolean') {
        throw Error(
          'The second argument to the Lexer constructor is now an ILexerConfig Object.\n' +
            'a boolean 2nd argument is no longer supported',
        )
      }
      // todo: defaults func?
      this.config = assign$1({}, DEFAULT_LEXER_CONFIG, config)
      const traceInitVal = this.config.traceInitPerf
      if (traceInitVal === true) {
        this.traceInitMaxIdent = Infinity
        this.traceInitPerf = true
      } else if (typeof traceInitVal === 'number') {
        this.traceInitMaxIdent = traceInitVal
        this.traceInitPerf = true
      }
      this.traceInitIndent = -1
      this.TRACE_INIT('Lexer Constructor', () => {
        let actualDefinition
        let hasOnlySingleMode = true
        this.TRACE_INIT('Lexer Config handling', () => {
          if (this.config.lineTerminatorsPattern === DEFAULT_LEXER_CONFIG.lineTerminatorsPattern) {
            // optimized built-in implementation for the defaults definition of lineTerminators
            this.config.lineTerminatorsPattern = LineTerminatorOptimizedTester
          } else {
            if (this.config.lineTerminatorCharacters === DEFAULT_LEXER_CONFIG.lineTerminatorCharacters) {
              throw Error(
                'Error: Missing <lineTerminatorCharacters> property on the Lexer config.\n' +
                  '\tFor details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#MISSING_LINE_TERM_CHARS',
              )
            }
          }
          if (config.safeMode && config.ensureOptimizations) {
            throw Error('"safeMode" and "ensureOptimizations" flags are mutually exclusive.')
          }
          this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking)
          this.trackEndLines = /full/i.test(this.config.positionTracking)
          // Convert SingleModeLexerDefinition into a IMultiModeLexerDefinition.
          if (isArray$1(lexerDefinition)) {
            actualDefinition = {
              modes: { defaultMode: clone(lexerDefinition) },
              defaultMode: DEFAULT_MODE,
            }
          } else {
            // no conversion needed, input should already be a IMultiModeLexerDefinition
            hasOnlySingleMode = false
            actualDefinition = clone(lexerDefinition)
          }
        })
        if (this.config.skipValidations === false) {
          this.TRACE_INIT('performRuntimeChecks', () => {
            this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(
              performRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters),
            )
          })
          this.TRACE_INIT('performWarningRuntimeChecks', () => {
            this.lexerDefinitionWarning = this.lexerDefinitionWarning.concat(
              performWarningRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters),
            )
          })
        }
        // for extra robustness to avoid throwing an none informative error message
        actualDefinition.modes = actualDefinition.modes ? actualDefinition.modes : {}
        // an error of undefined TokenTypes will be detected in "performRuntimeChecks" above.
        // this transformation is to increase robustness in the case of partially invalid lexer definition.
        forEach(actualDefinition.modes, (currModeValue, currModeName) => {
          actualDefinition.modes[currModeName] = reject(currModeValue, (currTokType) => isUndefined(currTokType))
        })
        const allModeNames = keys(actualDefinition.modes)
        forEach(actualDefinition.modes, (currModDef, currModName) => {
          this.TRACE_INIT(`Mode: <${currModName}> processing`, () => {
            this.modes.push(currModName)
            if (this.config.skipValidations === false) {
              this.TRACE_INIT(`validatePatterns`, () => {
                this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(
                  validatePatterns(currModDef, allModeNames),
                )
              })
            }
            // If definition errors were encountered, the analysis phase may fail unexpectedly/
            // Considering a lexer with definition errors may never be used, there is no point
            // to performing the analysis anyhow...
            if (isEmpty(this.lexerDefinitionErrors)) {
              augmentTokenTypes(currModDef)
              let currAnalyzeResult
              this.TRACE_INIT(`analyzeTokenTypes`, () => {
                currAnalyzeResult = analyzeTokenTypes(currModDef, {
                  lineTerminatorCharacters: this.config.lineTerminatorCharacters,
                  positionTracking: config.positionTracking,
                  ensureOptimizations: config.ensureOptimizations,
                  safeMode: config.safeMode,
                  tracer: this.TRACE_INIT,
                })
              })
              this.patternIdxToConfig[currModName] = currAnalyzeResult.patternIdxToConfig
              this.charCodeToPatternIdxToConfig[currModName] = currAnalyzeResult.charCodeToPatternIdxToConfig
              this.emptyGroups = assign$1({}, this.emptyGroups, currAnalyzeResult.emptyGroups)
              this.hasCustom = currAnalyzeResult.hasCustom || this.hasCustom
              this.canModeBeOptimized[currModName] = currAnalyzeResult.canBeOptimized
            }
          })
        })
        this.defaultMode = actualDefinition.defaultMode
        if (!isEmpty(this.lexerDefinitionErrors) && !this.config.deferDefinitionErrorsHandling) {
          const allErrMessages = map(this.lexerDefinitionErrors, (error) => {
            return error.message
          })
          const allErrMessagesString = allErrMessages.join('-----------------------\n')
          throw new Error('Errors detected in definition of Lexer:\n' + allErrMessagesString)
        }
        // Only print warning if there are no errors, This will avoid pl
        forEach(this.lexerDefinitionWarning, (warningDescriptor) => {
          PRINT_WARNING(warningDescriptor.message)
        })
        this.TRACE_INIT('Choosing sub-methods implementations', () => {
          // Choose the relevant internal implementations for this specific parser.
          // These implementations should be in-lined by the JavaScript engine
          // to provide optimal performance in each scenario.
          if (SUPPORT_STICKY) {
            this.chopInput = identity
            this.match = this.matchWithTest
          } else {
            this.updateLastIndex = noop
            this.match = this.matchWithExec
          }
          if (hasOnlySingleMode) {
            this.handleModes = noop
          }
          if (this.trackStartLines === false) {
            this.computeNewColumn = identity
          }
          if (this.trackEndLines === false) {
            this.updateTokenEndLineColumnLocation = noop
          }
          if (/full/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createFullToken
          } else if (/onlyStart/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createStartOnlyToken
          } else if (/onlyOffset/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createOffsetOnlyToken
          } else {
            throw Error(`Invalid <positionTracking> config option: "${this.config.positionTracking}"`)
          }
          if (this.hasCustom) {
            this.addToken = this.addTokenUsingPush
            this.handlePayload = this.handlePayloadWithCustom
          } else {
            this.addToken = this.addTokenUsingMemberAccess
            this.handlePayload = this.handlePayloadNoCustom
          }
        })
        this.TRACE_INIT('Failed Optimization Warnings', () => {
          const unOptimizedModes = reduce(
            this.canModeBeOptimized,
            (cannotBeOptimized, canBeOptimized, modeName) => {
              if (canBeOptimized === false) {
                cannotBeOptimized.push(modeName)
              }
              return cannotBeOptimized
            },
            [],
          )
          if (config.ensureOptimizations && !isEmpty(unOptimizedModes)) {
            throw Error(
              `Lexer Modes: < ${unOptimizedModes.join(', ')} > cannot be optimized.\n` +
                '\t Disable the "ensureOptimizations" lexer config flag to silently ignore this and run the lexer in an un-optimized mode.\n' +
                '\t Or inspect the console log for details on how to resolve these issues.',
            )
          }
        })
        this.TRACE_INIT('clearRegExpParserCache', () => {
          clearRegExpParserCache()
        })
        this.TRACE_INIT('toFastProperties', () => {
          toFastProperties(this)
        })
      })
    }
    tokenize(text, initialMode = this.defaultMode) {
      if (!isEmpty(this.lexerDefinitionErrors)) {
        const allErrMessages = map(this.lexerDefinitionErrors, (error) => {
          return error.message
        })
        const allErrMessagesString = allErrMessages.join('-----------------------\n')
        throw new Error('Unable to Tokenize because Errors detected in definition of Lexer:\n' + allErrMessagesString)
      }
      return this.tokenizeInternal(text, initialMode)
    }
    // There is quite a bit of duplication between this and "tokenizeInternalLazy"
    // This is intentional due to performance considerations.
    // this method also used quite a bit of `!` none null assertions because it is too optimized
    // for `tsc` to always understand it is "safe"
    tokenizeInternal(text, initialMode) {
      let i,
        j,
        k,
        matchAltImage,
        longerAlt,
        matchedImage,
        payload,
        altPayload,
        imageLength,
        group,
        tokType,
        newToken,
        errLength,
        msg,
        match
      const orgText = text
      const orgLength = orgText.length
      let offset = 0
      let matchedTokensIndex = 0
      // initializing the tokensArray to the "guessed" size.
      // guessing too little will still reduce the number of array re-sizes on pushes.
      // guessing too large (Tested by guessing x4 too large) may cost a bit more of memory
      // but would still have a faster runtime by avoiding (All but one) array resizing.
      const guessedNumberOfTokens = this.hasCustom
        ? 0 // will break custom token pattern APIs the matchedTokens array will contain undefined elements.
        : Math.floor(text.length / 10)
      const matchedTokens = new Array(guessedNumberOfTokens)
      const errors = []
      let line = this.trackStartLines ? 1 : undefined
      let column = this.trackStartLines ? 1 : undefined
      const groups = cloneEmptyGroups(this.emptyGroups)
      const trackLines = this.trackStartLines
      const lineTerminatorPattern = this.config.lineTerminatorsPattern
      let currModePatternsLength = 0
      let patternIdxToConfig = []
      let currCharCodeToPatternIdxToConfig = []
      const modeStack = []
      const emptyArray = []
      Object.freeze(emptyArray)
      let getPossiblePatterns
      function getPossiblePatternsSlow() {
        return patternIdxToConfig
      }
      function getPossiblePatternsOptimized(charCode) {
        const optimizedCharIdx = charCodeToOptimizedIndex(charCode)
        const possiblePatterns = currCharCodeToPatternIdxToConfig[optimizedCharIdx]
        if (possiblePatterns === undefined) {
          return emptyArray
        } else {
          return possiblePatterns
        }
      }
      const pop_mode = (popToken) => {
        // TODO: perhaps avoid this error in the edge case there is no more input?
        if (
          modeStack.length === 1 &&
          // if we have both a POP_MODE and a PUSH_MODE this is in-fact a "transition"
          // So no error should occur.
          popToken.tokenType.PUSH_MODE === undefined
        ) {
          // if we try to pop the last mode there lexer will no longer have ANY mode.
          // thus the pop is ignored, an error will be created and the lexer will continue parsing in the previous mode.
          const msg = this.config.errorMessageProvider.buildUnableToPopLexerModeMessage(popToken)
          errors.push({
            offset: popToken.startOffset,
            line: popToken.startLine,
            column: popToken.startColumn,
            length: popToken.image.length,
            message: msg,
          })
        } else {
          modeStack.pop()
          const newMode = last(modeStack)
          patternIdxToConfig = this.patternIdxToConfig[newMode]
          currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode]
          currModePatternsLength = patternIdxToConfig.length
          const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false
          if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
            getPossiblePatterns = getPossiblePatternsOptimized
          } else {
            getPossiblePatterns = getPossiblePatternsSlow
          }
        }
      }
      function push_mode(newMode) {
        modeStack.push(newMode)
        currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode]
        patternIdxToConfig = this.patternIdxToConfig[newMode]
        currModePatternsLength = patternIdxToConfig.length
        currModePatternsLength = patternIdxToConfig.length
        const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false
        if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
          getPossiblePatterns = getPossiblePatternsOptimized
        } else {
          getPossiblePatterns = getPossiblePatternsSlow
        }
      }
      // this pattern seems to avoid a V8 de-optimization, although that de-optimization does not
      // seem to matter performance wise.
      push_mode.call(this, initialMode)
      let currConfig
      const recoveryEnabled = this.config.recoveryEnabled
      while (offset < orgLength) {
        matchedImage = null
        const nextCharCode = orgText.charCodeAt(offset)
        const chosenPatternIdxToConfig = getPossiblePatterns(nextCharCode)
        const chosenPatternsLength = chosenPatternIdxToConfig.length
        for (i = 0; i < chosenPatternsLength; i++) {
          currConfig = chosenPatternIdxToConfig[i]
          const currPattern = currConfig.pattern
          payload = null
          // manually in-lined because > 600 chars won't be in-lined in V8
          const singleCharCode = currConfig.short
          if (singleCharCode !== false) {
            if (nextCharCode === singleCharCode) {
              // single character string
              matchedImage = currPattern
            }
          } else if (currConfig.isCustom === true) {
            match = currPattern.exec(orgText, offset, matchedTokens, groups)
            if (match !== null) {
              matchedImage = match[0]
              if (match.payload !== undefined) {
                payload = match.payload
              }
            } else {
              matchedImage = null
            }
          } else {
            this.updateLastIndex(currPattern, offset)
            matchedImage = this.match(currPattern, text, offset)
          }
          if (matchedImage !== null) {
            // even though this pattern matched we must try a another longer alternative.
            // this can be used to prioritize keywords over identifiers
            longerAlt = currConfig.longerAlt
            if (longerAlt !== undefined) {
              // TODO: micro optimize, avoid extra prop access
              // by saving/linking longerAlt on the original config?
              const longerAltLength = longerAlt.length
              for (k = 0; k < longerAltLength; k++) {
                const longerAltConfig = patternIdxToConfig[longerAlt[k]]
                const longerAltPattern = longerAltConfig.pattern
                altPayload = null
                // single Char can never be a longer alt so no need to test it.
                // manually in-lined because > 600 chars won't be in-lined in V8
                if (longerAltConfig.isCustom === true) {
                  match = longerAltPattern.exec(orgText, offset, matchedTokens, groups)
                  if (match !== null) {
                    matchAltImage = match[0]
                    if (match.payload !== undefined) {
                      altPayload = match.payload
                    }
                  } else {
                    matchAltImage = null
                  }
                } else {
                  this.updateLastIndex(longerAltPattern, offset)
                  matchAltImage = this.match(longerAltPattern, text, offset)
                }
                if (matchAltImage && matchAltImage.length > matchedImage.length) {
                  matchedImage = matchAltImage
                  payload = altPayload
                  currConfig = longerAltConfig
                  // Exit the loop early after matching one of the longer alternatives
                  // The first matched alternative takes precedence
                  break
                }
              }
            }
            break
          }
        }
        // successful match
        if (matchedImage !== null) {
          imageLength = matchedImage.length
          group = currConfig.group
          if (group !== undefined) {
            tokType = currConfig.tokenTypeIdx
            // TODO: "offset + imageLength" and the new column may be computed twice in case of "full" location information inside
            // createFullToken method
            newToken = this.createTokenInstance(
              matchedImage,
              offset,
              tokType,
              currConfig.tokenType,
              line,
              column,
              imageLength,
            )
            this.handlePayload(newToken, payload)
            // TODO: optimize NOOP in case there are no special groups?
            if (group === false) {
              matchedTokensIndex = this.addToken(matchedTokens, matchedTokensIndex, newToken)
            } else {
              groups[group].push(newToken)
            }
          }
          text = this.chopInput(text, imageLength)
          offset = offset + imageLength
          // TODO: with newlines the column may be assigned twice
          column = this.computeNewColumn(column, imageLength)
          if (trackLines === true && currConfig.canLineTerminator === true) {
            let numOfLTsInMatch = 0
            let foundTerminator
            let lastLTEndOffset
            lineTerminatorPattern.lastIndex = 0
            do {
              foundTerminator = lineTerminatorPattern.test(matchedImage)
              if (foundTerminator === true) {
                lastLTEndOffset = lineTerminatorPattern.lastIndex - 1
                numOfLTsInMatch++
              }
            } while (foundTerminator === true)
            if (numOfLTsInMatch !== 0) {
              line = line + numOfLTsInMatch
              column = imageLength - lastLTEndOffset
              this.updateTokenEndLineColumnLocation(
                newToken,
                group,
                lastLTEndOffset,
                numOfLTsInMatch,
                line,
                column,
                imageLength,
              )
            }
          }
          // will be NOOP if no modes present
          this.handleModes(currConfig, pop_mode, push_mode, newToken)
        } else {
          // error recovery, drop characters until we identify a valid token's start point
          const errorStartOffset = offset
          const errorLine = line
          const errorColumn = column
          let foundResyncPoint = recoveryEnabled === false
          while (foundResyncPoint === false && offset < orgLength) {
            // Identity Func (when sticky flag is enabled)
            text = this.chopInput(text, 1)
            offset++
            for (j = 0; j < currModePatternsLength; j++) {
              const currConfig = patternIdxToConfig[j]
              const currPattern = currConfig.pattern
              // manually in-lined because > 600 chars won't be in-lined in V8
              const singleCharCode = currConfig.short
              if (singleCharCode !== false) {
                if (orgText.charCodeAt(offset) === singleCharCode) {
                  // single character string
                  foundResyncPoint = true
                }
              } else if (currConfig.isCustom === true) {
                foundResyncPoint = currPattern.exec(orgText, offset, matchedTokens, groups) !== null
              } else {
                this.updateLastIndex(currPattern, offset)
                foundResyncPoint = currPattern.exec(text) !== null
              }
              if (foundResyncPoint === true) {
                break
              }
            }
          }
          errLength = offset - errorStartOffset
          column = this.computeNewColumn(column, errLength)
          // at this point we either re-synced or reached the end of the input text
          msg = this.config.errorMessageProvider.buildUnexpectedCharactersMessage(
            orgText,
            errorStartOffset,
            errLength,
            errorLine,
            errorColumn,
          )
          errors.push({
            offset: errorStartOffset,
            line: errorLine,
            column: errorColumn,
            length: errLength,
            message: msg,
          })
          if (recoveryEnabled === false) {
            break
          }
        }
      }
      // if we do have custom patterns which push directly into the
      // TODO: custom tokens should not push directly??
      if (!this.hasCustom) {
        // if we guessed a too large size for the tokens array this will shrink it to the right size.
        matchedTokens.length = matchedTokensIndex
      }
      return {
        tokens: matchedTokens,
        groups: groups,
        errors: errors,
      }
    }
    handleModes(config, pop_mode, push_mode, newToken) {
      if (config.pop === true) {
        // need to save the PUSH_MODE property as if the mode is popped
        // patternIdxToPopMode is updated to reflect the new mode after popping the stack
        const pushMode = config.push
        pop_mode(newToken)
        if (pushMode !== undefined) {
          push_mode.call(this, pushMode)
        }
      } else if (config.push !== undefined) {
        push_mode.call(this, config.push)
      }
    }
    chopInput(text, length) {
      return text.substring(length)
    }
    updateLastIndex(regExp, newLastIndex) {
      regExp.lastIndex = newLastIndex
    }
    // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
    updateTokenEndLineColumnLocation(newToken, group, lastLTIdx, numOfLTsInMatch, line, column, imageLength) {
      let lastCharIsLT, fixForEndingInLT
      if (group !== undefined) {
        // a none skipped multi line Token, need to update endLine/endColumn
        lastCharIsLT = lastLTIdx === imageLength - 1
        fixForEndingInLT = lastCharIsLT ? -1 : 0
        if (!(numOfLTsInMatch === 1 && lastCharIsLT === true)) {
          // if a token ends in a LT that last LT only affects the line numbering of following Tokens
          newToken.endLine = line + fixForEndingInLT
          // the last LT in a token does not affect the endColumn either as the [columnStart ... columnEnd)
          // inclusive to exclusive range.
          newToken.endColumn = column - 1 + -fixForEndingInLT
        }
        // else single LT in the last character of a token, no need to modify the endLine/EndColumn
      }
    }
    computeNewColumn(oldColumn, imageLength) {
      return oldColumn + imageLength
    }
    createOffsetOnlyToken(image, startOffset, tokenTypeIdx, tokenType) {
      return {
        image,
        startOffset,
        tokenTypeIdx,
        tokenType,
      }
    }
    createStartOnlyToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn) {
      return {
        image,
        startOffset,
        startLine,
        startColumn,
        tokenTypeIdx,
        tokenType,
      }
    }
    createFullToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn, imageLength) {
      return {
        image,
        startOffset,
        endOffset: startOffset + imageLength - 1,
        startLine,
        endLine: startLine,
        startColumn,
        endColumn: startColumn + imageLength - 1,
        tokenTypeIdx,
        tokenType,
      }
    }
    addTokenUsingPush(tokenVector, index, tokenToAdd) {
      tokenVector.push(tokenToAdd)
      return index
    }
    addTokenUsingMemberAccess(tokenVector, index, tokenToAdd) {
      tokenVector[index] = tokenToAdd
      index++
      return index
    }
    handlePayloadNoCustom(token, payload) {}
    handlePayloadWithCustom(token, payload) {
      if (payload !== null) {
        token.payload = payload
      }
    }
    matchWithTest(pattern, text, offset) {
      const found = pattern.test(text)
      if (found === true) {
        return text.substring(offset, pattern.lastIndex)
      }
      return null
    }
    matchWithExec(pattern, text) {
      const regExpArray = pattern.exec(text)
      return regExpArray !== null ? regExpArray[0] : null
    }
  }
  Lexer.SKIPPED =
    'This marks a skipped Token pattern, this means each token identified by it will' +
    'be consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.'
  Lexer.NA = /NOT_APPLICABLE/

  function tokenLabel(tokType) {
    if (hasTokenLabel(tokType)) {
      return tokType.LABEL
    } else {
      return tokType.name
    }
  }
  function hasTokenLabel(obj) {
    return isString(obj.LABEL) && obj.LABEL !== ''
  }
  const PARENT = 'parent'
  const CATEGORIES = 'categories'
  const LABEL = 'label'
  const GROUP = 'group'
  const PUSH_MODE = 'push_mode'
  const POP_MODE = 'pop_mode'
  const LONGER_ALT = 'longer_alt'
  const LINE_BREAKS = 'line_breaks'
  const START_CHARS_HINT = 'start_chars_hint'
  function createToken(config) {
    return createTokenInternal(config)
  }
  function createTokenInternal(config) {
    const pattern = config.pattern
    const tokenType = {}
    tokenType.name = config.name
    if (!isUndefined(pattern)) {
      tokenType.PATTERN = pattern
    }
    if (has(config, PARENT)) {
      throw (
        'The parent property is no longer supported.\n' +
        'See: https://github.com/chevrotain/chevrotain/issues/564#issuecomment-349062346 for details.'
      )
    }
    if (has(config, CATEGORIES)) {
      // casting to ANY as this will be fixed inside `augmentTokenTypes``
      tokenType.CATEGORIES = config[CATEGORIES]
    }
    augmentTokenTypes([tokenType])
    if (has(config, LABEL)) {
      tokenType.LABEL = config[LABEL]
    }
    if (has(config, GROUP)) {
      tokenType.GROUP = config[GROUP]
    }
    if (has(config, POP_MODE)) {
      tokenType.POP_MODE = config[POP_MODE]
    }
    if (has(config, PUSH_MODE)) {
      tokenType.PUSH_MODE = config[PUSH_MODE]
    }
    if (has(config, LONGER_ALT)) {
      tokenType.LONGER_ALT = config[LONGER_ALT]
    }
    if (has(config, LINE_BREAKS)) {
      tokenType.LINE_BREAKS = config[LINE_BREAKS]
    }
    if (has(config, START_CHARS_HINT)) {
      tokenType.START_CHARS_HINT = config[START_CHARS_HINT]
    }
    return tokenType
  }
  const EOF = createToken({ name: 'EOF', pattern: Lexer.NA })
  augmentTokenTypes([EOF])
  function createTokenInstance(tokType, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
    return {
      image,
      startOffset,
      endOffset,
      startLine,
      endLine,
      startColumn,
      endColumn,
      tokenTypeIdx: tokType.tokenTypeIdx,
      tokenType: tokType,
    }
  }
  function tokenMatcher(token, tokType) {
    return tokenStructuredMatcher(token, tokType)
  }

  const defaultParserErrorProvider = {
    buildMismatchTokenMessage({ expected, actual, previous, ruleName }) {
      const hasLabel = hasTokenLabel(expected)
      const expectedMsg = hasLabel ? `--> ${tokenLabel(expected)} <--` : `token of type --> ${expected.name} <--`
      const msg = `Expecting ${expectedMsg} but found --> '${actual.image}' <--`
      return msg
    },
    buildNotAllInputParsedMessage({ firstRedundant, ruleName }) {
      return 'Redundant input, expecting EOF but found: ' + firstRedundant.image
    },
    buildNoViableAltMessage({ expectedPathsPerAlt, actual, previous, customUserDescription, ruleName }) {
      const errPrefix = 'Expecting: '
      // TODO: issue: No Viable Alternative Error may have incomplete details. #502
      const actualText = head(actual).image
      const errSuffix = "\nbut found: '" + actualText + "'"
      if (customUserDescription) {
        return errPrefix + customUserDescription + errSuffix
      } else {
        const allLookAheadPaths = reduce(expectedPathsPerAlt, (result, currAltPaths) => result.concat(currAltPaths), [])
        const nextValidTokenSequences = map(
          allLookAheadPaths,
          (currPath) => `[${map(currPath, (currTokenType) => tokenLabel(currTokenType)).join(', ')}]`,
        )
        const nextValidSequenceItems = map(nextValidTokenSequences, (itemMsg, idx) => `  ${idx + 1}. ${itemMsg}`)
        const calculatedDescription = `one of these possible Token sequences:\n${nextValidSequenceItems.join('\n')}`
        return errPrefix + calculatedDescription + errSuffix
      }
    },
    buildEarlyExitMessage({ expectedIterationPaths, actual, customUserDescription, ruleName }) {
      const errPrefix = 'Expecting: '
      // TODO: issue: No Viable Alternative Error may have incomplete details. #502
      const actualText = head(actual).image
      const errSuffix = "\nbut found: '" + actualText + "'"
      if (customUserDescription) {
        return errPrefix + customUserDescription + errSuffix
      } else {
        const nextValidTokenSequences = map(
          expectedIterationPaths,
          (currPath) => `[${map(currPath, (currTokenType) => tokenLabel(currTokenType)).join(',')}]`,
        )
        const calculatedDescription =
          `expecting at least one iteration which starts with one of these possible Token sequences::\n  ` +
          `<${nextValidTokenSequences.join(' ,')}>`
        return errPrefix + calculatedDescription + errSuffix
      }
    },
  }
  Object.freeze(defaultParserErrorProvider)
  const defaultGrammarResolverErrorProvider = {
    buildRuleNotFoundError(topLevelRule, undefinedRule) {
      const msg =
        'Invalid grammar, reference to a rule which is not defined: ->' +
        undefinedRule.nonTerminalName +
        '<-\n' +
        'inside top level rule: ->' +
        topLevelRule.name +
        '<-'
      return msg
    },
  }
  const defaultGrammarValidatorErrorProvider = {
    buildDuplicateFoundError(topLevelRule, duplicateProds) {
      function getExtraProductionArgument(prod) {
        if (prod instanceof Terminal) {
          return prod.terminalType.name
        } else if (prod instanceof NonTerminal) {
          return prod.nonTerminalName
        } else {
          return ''
        }
      }
      const topLevelName = topLevelRule.name
      const duplicateProd = head(duplicateProds)
      const index = duplicateProd.idx
      const dslName = getProductionDslName(duplicateProd)
      const extraArgument = getExtraProductionArgument(duplicateProd)
      const hasExplicitIndex = index > 0
      let msg = `->${dslName}${hasExplicitIndex ? index : ''}<- ${
        extraArgument ? `with argument: ->${extraArgument}<-` : ''
      }
                  appears more than once (${
                    duplicateProds.length
                  } times) in the top level rule: ->${topLevelName}<-.                  
                  For further details see: https://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES 
                  `
      // white space trimming time! better to trim afterwards as it allows to use WELL formatted multi line template strings...
      msg = msg.replace(/[ \t]+/g, ' ')
      msg = msg.replace(/\s\s+/g, '\n')
      return msg
    },
    buildNamespaceConflictError(rule) {
      const errMsg =
        `Namespace conflict found in grammar.\n` +
        `The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <${rule.name}>.\n` +
        `To resolve this make sure each Terminal and Non-Terminal names are unique\n` +
        `This is easy to accomplish by using the convention that Terminal names start with an uppercase letter\n` +
        `and Non-Terminal names start with a lower case letter.`
      return errMsg
    },
    buildAlternationPrefixAmbiguityError(options) {
      const pathMsg = map(options.prefixPath, (currTok) => tokenLabel(currTok)).join(', ')
      const occurrence = options.alternation.idx === 0 ? '' : options.alternation.idx
      const errMsg =
        `Ambiguous alternatives: <${options.ambiguityIndices.join(' ,')}> due to common lookahead prefix\n` +
        `in <OR${occurrence}> inside <${options.topLevelRule.name}> Rule,\n` +
        `<${pathMsg}> may appears as a prefix path in all these alternatives.\n` +
        `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#COMMON_PREFIX\n` +
        `For Further details.`
      return errMsg
    },
    buildAlternationAmbiguityError(options) {
      const pathMsg = map(options.prefixPath, (currtok) => tokenLabel(currtok)).join(', ')
      const occurrence = options.alternation.idx === 0 ? '' : options.alternation.idx
      let currMessage =
        `Ambiguous Alternatives Detected: <${options.ambiguityIndices.join(' ,')}> in <OR${occurrence}>` +
        ` inside <${options.topLevelRule.name}> Rule,\n` +
        `<${pathMsg}> may appears as a prefix path in all these alternatives.\n`
      currMessage =
        currMessage +
        `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES\n` +
        `For Further details.`
      return currMessage
    },
    buildEmptyRepetitionError(options) {
      let dslName = getProductionDslName(options.repetition)
      if (options.repetition.idx !== 0) {
        dslName += options.repetition.idx
      }
      const errMsg =
        `The repetition <${dslName}> within Rule <${options.topLevelRule.name}> can never consume any tokens.\n` +
        `This could lead to an infinite loop.`
      return errMsg
    },
    // TODO: remove - `errors_public` from nyc.config.js exclude
    //       once this method is fully removed from this file
    buildTokenNameError(options) {
      /* istanbul ignore next */
      return 'deprecated'
    },
    buildEmptyAlternationError(options) {
      const errMsg =
        `Ambiguous empty alternative: <${options.emptyChoiceIdx + 1}>` +
        ` in <OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.\n` +
        `Only the last alternative may be an empty alternative.`
      return errMsg
    },
    buildTooManyAlternativesError(options) {
      const errMsg =
        `An Alternation cannot have more than 256 alternatives:\n` +
        `<OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.\n has ${
          options.alternation.definition.length + 1
        } alternatives.`
      return errMsg
    },
    buildLeftRecursionError(options) {
      const ruleName = options.topLevelRule.name
      const pathNames = map(options.leftRecursionPath, (currRule) => currRule.name)
      const leftRecursivePath = `${ruleName} --> ${pathNames.concat([ruleName]).join(' --> ')}`
      const errMsg =
        `Left Recursion found in grammar.\n` +
        `rule: <${ruleName}> can be invoked from itself (directly or indirectly)\n` +
        `without consuming any Tokens. The grammar path that causes this is: \n ${leftRecursivePath}\n` +
        ` To fix this refactor your grammar to remove the left recursion.\n` +
        `see: https://en.wikipedia.org/wiki/LL_parser#Left_factoring.`
      return errMsg
    },
    // TODO: remove - `errors_public` from nyc.config.js exclude
    //       once this method is fully removed from this file
    buildInvalidRuleNameError(options) {
      /* istanbul ignore next */
      return 'deprecated'
    },
    buildDuplicateRuleNameError(options) {
      let ruleName
      if (options.topLevelRule instanceof Rule) {
        ruleName = options.topLevelRule.name
      } else {
        ruleName = options.topLevelRule
      }
      const errMsg = `Duplicate definition, rule: ->${ruleName}<- is already defined in the grammar: ->${options.grammarName}<-`
      return errMsg
    },
  }

  function resolveGrammar$1(topLevels, errMsgProvider) {
    const refResolver = new GastRefResolverVisitor(topLevels, errMsgProvider)
    refResolver.resolveRefs()
    return refResolver.errors
  }
  class GastRefResolverVisitor extends GAstVisitor {
    constructor(nameToTopRule, errMsgProvider) {
      super()
      this.nameToTopRule = nameToTopRule
      this.errMsgProvider = errMsgProvider
      this.errors = []
    }
    resolveRefs() {
      forEach(values(this.nameToTopRule), (prod) => {
        this.currTopLevel = prod
        prod.accept(this)
      })
    }
    visitNonTerminal(node) {
      const ref = this.nameToTopRule[node.nonTerminalName]
      if (!ref) {
        const msg = this.errMsgProvider.buildRuleNotFoundError(this.currTopLevel, node)
        this.errors.push({
          message: msg,
          type: ParserDefinitionErrorType.UNRESOLVED_SUBRULE_REF,
          ruleName: this.currTopLevel.name,
          unresolvedRefName: node.nonTerminalName,
        })
      } else {
        node.referencedRule = ref
      }
    }
  }

  class AbstractNextPossibleTokensWalker extends RestWalker {
    constructor(topProd, path) {
      super()
      this.topProd = topProd
      this.path = path
      this.possibleTokTypes = []
      this.nextProductionName = ''
      this.nextProductionOccurrence = 0
      this.found = false
      this.isAtEndOfPath = false
    }
    startWalking() {
      this.found = false
      if (this.path.ruleStack[0] !== this.topProd.name) {
        throw Error("The path does not start with the walker's top Rule!")
      }
      // immutable for the win
      this.ruleStack = clone(this.path.ruleStack).reverse() // intelij bug requires assertion
      this.occurrenceStack = clone(this.path.occurrenceStack).reverse() // intelij bug requires assertion
      // already verified that the first production is valid, we now seek the 2nd production
      this.ruleStack.pop()
      this.occurrenceStack.pop()
      this.updateExpectedNext()
      this.walk(this.topProd)
      return this.possibleTokTypes
    }
    walk(prod, prevRest = []) {
      // stop scanning once we found the path
      if (!this.found) {
        super.walk(prod, prevRest)
      }
    }
    walkProdRef(refProd, currRest, prevRest) {
      // found the next production, need to keep walking in it
      if (refProd.referencedRule.name === this.nextProductionName && refProd.idx === this.nextProductionOccurrence) {
        const fullRest = currRest.concat(prevRest)
        this.updateExpectedNext()
        this.walk(refProd.referencedRule, fullRest)
      }
    }
    updateExpectedNext() {
      // need to consume the Terminal
      if (isEmpty(this.ruleStack)) {
        // must reset nextProductionXXX to avoid walking down another Top Level production while what we are
        // really seeking is the last Terminal...
        this.nextProductionName = ''
        this.nextProductionOccurrence = 0
        this.isAtEndOfPath = true
      } else {
        this.nextProductionName = this.ruleStack.pop()
        this.nextProductionOccurrence = this.occurrenceStack.pop()
      }
    }
  }
  class NextAfterTokenWalker extends AbstractNextPossibleTokensWalker {
    constructor(topProd, path) {
      super(topProd, path)
      this.path = path
      this.nextTerminalName = ''
      this.nextTerminalOccurrence = 0
      this.nextTerminalName = this.path.lastTok.name
      this.nextTerminalOccurrence = this.path.lastTokOccurrence
    }
    walkTerminal(terminal, currRest, prevRest) {
      if (
        this.isAtEndOfPath &&
        terminal.terminalType.name === this.nextTerminalName &&
        terminal.idx === this.nextTerminalOccurrence &&
        !this.found
      ) {
        const fullRest = currRest.concat(prevRest)
        const restProd = new Alternative({ definition: fullRest })
        this.possibleTokTypes = first(restProd)
        this.found = true
      }
    }
  }
  /**
   * This walker only "walks" a single "TOP" level in the Grammar Ast, this means
   * it never "follows" production refs
   */
  class AbstractNextTerminalAfterProductionWalker extends RestWalker {
    constructor(topRule, occurrence) {
      super()
      this.topRule = topRule
      this.occurrence = occurrence
      this.result = {
        token: undefined,
        occurrence: undefined,
        isEndOfRule: undefined,
      }
    }
    startWalking() {
      this.walk(this.topRule)
      return this.result
    }
  }
  class NextTerminalAfterManyWalker extends AbstractNextTerminalAfterProductionWalker {
    walkMany(manyProd, currRest, prevRest) {
      if (manyProd.idx === this.occurrence) {
        const firstAfterMany = head(currRest.concat(prevRest))
        this.result.isEndOfRule = firstAfterMany === undefined
        if (firstAfterMany instanceof Terminal) {
          this.result.token = firstAfterMany.terminalType
          this.result.occurrence = firstAfterMany.idx
        }
      } else {
        super.walkMany(manyProd, currRest, prevRest)
      }
    }
  }
  class NextTerminalAfterManySepWalker extends AbstractNextTerminalAfterProductionWalker {
    walkManySep(manySepProd, currRest, prevRest) {
      if (manySepProd.idx === this.occurrence) {
        const firstAfterManySep = head(currRest.concat(prevRest))
        this.result.isEndOfRule = firstAfterManySep === undefined
        if (firstAfterManySep instanceof Terminal) {
          this.result.token = firstAfterManySep.terminalType
          this.result.occurrence = firstAfterManySep.idx
        }
      } else {
        super.walkManySep(manySepProd, currRest, prevRest)
      }
    }
  }
  class NextTerminalAfterAtLeastOneWalker extends AbstractNextTerminalAfterProductionWalker {
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      if (atLeastOneProd.idx === this.occurrence) {
        const firstAfterAtLeastOne = head(currRest.concat(prevRest))
        this.result.isEndOfRule = firstAfterAtLeastOne === undefined
        if (firstAfterAtLeastOne instanceof Terminal) {
          this.result.token = firstAfterAtLeastOne.terminalType
          this.result.occurrence = firstAfterAtLeastOne.idx
        }
      } else {
        super.walkAtLeastOne(atLeastOneProd, currRest, prevRest)
      }
    }
  }
  // TODO: reduce code duplication in the AfterWalkers
  class NextTerminalAfterAtLeastOneSepWalker extends AbstractNextTerminalAfterProductionWalker {
    walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest) {
      if (atleastOneSepProd.idx === this.occurrence) {
        const firstAfterfirstAfterAtLeastOneSep = head(currRest.concat(prevRest))
        this.result.isEndOfRule = firstAfterfirstAfterAtLeastOneSep === undefined
        if (firstAfterfirstAfterAtLeastOneSep instanceof Terminal) {
          this.result.token = firstAfterfirstAfterAtLeastOneSep.terminalType
          this.result.occurrence = firstAfterfirstAfterAtLeastOneSep.idx
        }
      } else {
        super.walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest)
      }
    }
  }
  function possiblePathsFrom(targetDef, maxLength, currPath = []) {
    // avoid side effects
    currPath = clone(currPath)
    let result = []
    let i = 0
    // TODO: avoid inner funcs
    function remainingPathWith(nextDef) {
      return nextDef.concat(drop(targetDef, i + 1))
    }
    // TODO: avoid inner funcs
    function getAlternativesForProd(definition) {
      const alternatives = possiblePathsFrom(remainingPathWith(definition), maxLength, currPath)
      return result.concat(alternatives)
    }
    /**
     * Mandatory productions will halt the loop as the paths computed from their recursive calls will already contain the
     * following (rest) of the targetDef.
     *
     * For optional productions (Option/Repetition/...) the loop will continue to represent the paths that do not include the
     * the optional production.
     */
    while (currPath.length < maxLength && i < targetDef.length) {
      const prod = targetDef[i]
      /* istanbul ignore else */
      if (prod instanceof Alternative) {
        return getAlternativesForProd(prod.definition)
      } else if (prod instanceof NonTerminal) {
        return getAlternativesForProd(prod.definition)
      } else if (prod instanceof Option) {
        result = getAlternativesForProd(prod.definition)
      } else if (prod instanceof RepetitionMandatory) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: prod.definition,
          }),
        ])
        return getAlternativesForProd(newDef)
      } else if (prod instanceof RepetitionMandatoryWithSeparator) {
        const newDef = [
          new Alternative({ definition: prod.definition }),
          new Repetition({
            definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition),
          }),
        ]
        return getAlternativesForProd(newDef)
      } else if (prod instanceof RepetitionWithSeparator) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition),
          }),
        ])
        result = getAlternativesForProd(newDef)
      } else if (prod instanceof Repetition) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: prod.definition,
          }),
        ])
        result = getAlternativesForProd(newDef)
      } else if (prod instanceof Alternation) {
        forEach(prod.definition, (currAlt) => {
          // TODO: this is a limited check for empty alternatives
          //   It would prevent a common case of infinite loops during parser initialization.
          //   However **in-directly** empty alternatives may still cause issues.
          if (isEmpty(currAlt.definition) === false) {
            result = getAlternativesForProd(currAlt.definition)
          }
        })
        return result
      } else if (prod instanceof Terminal) {
        currPath.push(prod.terminalType)
      } else {
        throw Error('non exhaustive match')
      }
      i++
    }
    result.push({
      partialPath: currPath,
      suffixDef: drop(targetDef, i),
    })
    return result
  }
  function nextPossibleTokensAfter(initialDef, tokenVector, tokMatcher, maxLookAhead) {
    const EXIT_NON_TERMINAL = 'EXIT_NONE_TERMINAL'
    // to avoid creating a new Array each time.
    const EXIT_NON_TERMINAL_ARR = [EXIT_NON_TERMINAL]
    const EXIT_ALTERNATIVE = 'EXIT_ALTERNATIVE'
    let foundCompletePath = false
    const tokenVectorLength = tokenVector.length
    const minimalAlternativesIndex = tokenVectorLength - maxLookAhead - 1
    const result = []
    const possiblePaths = []
    possiblePaths.push({
      idx: -1,
      def: initialDef,
      ruleStack: [],
      occurrenceStack: [],
    })
    while (!isEmpty(possiblePaths)) {
      const currPath = possiblePaths.pop()
      // skip alternatives if no more results can be found (assuming deterministic grammar with fixed lookahead)
      if (currPath === EXIT_ALTERNATIVE) {
        if (foundCompletePath && last(possiblePaths).idx <= minimalAlternativesIndex) {
          // remove irrelevant alternative
          possiblePaths.pop()
        }
        continue
      }
      const currDef = currPath.def
      const currIdx = currPath.idx
      const currRuleStack = currPath.ruleStack
      const currOccurrenceStack = currPath.occurrenceStack
      // For Example: an empty path could exist in a valid grammar in the case of an EMPTY_ALT
      if (isEmpty(currDef)) {
        continue
      }
      const prod = currDef[0]
      /* istanbul ignore else */
      if (prod === EXIT_NON_TERMINAL) {
        const nextPath = {
          idx: currIdx,
          def: drop(currDef),
          ruleStack: dropRight(currRuleStack),
          occurrenceStack: dropRight(currOccurrenceStack),
        }
        possiblePaths.push(nextPath)
      } else if (prod instanceof Terminal) {
        /* istanbul ignore else */
        if (currIdx < tokenVectorLength - 1) {
          const nextIdx = currIdx + 1
          const actualToken = tokenVector[nextIdx]
          if (tokMatcher(actualToken, prod.terminalType)) {
            const nextPath = {
              idx: nextIdx,
              def: drop(currDef),
              ruleStack: currRuleStack,
              occurrenceStack: currOccurrenceStack,
            }
            possiblePaths.push(nextPath)
          }
          // end of the line
        } else if (currIdx === tokenVectorLength - 1) {
          // IGNORE ABOVE ELSE
          result.push({
            nextTokenType: prod.terminalType,
            nextTokenOccurrence: prod.idx,
            ruleStack: currRuleStack,
            occurrenceStack: currOccurrenceStack,
          })
          foundCompletePath = true
        } else {
          throw Error('non exhaustive match')
        }
      } else if (prod instanceof NonTerminal) {
        const newRuleStack = clone(currRuleStack)
        newRuleStack.push(prod.nonTerminalName)
        const newOccurrenceStack = clone(currOccurrenceStack)
        newOccurrenceStack.push(prod.idx)
        const nextPath = {
          idx: currIdx,
          def: prod.definition.concat(EXIT_NON_TERMINAL_ARR, drop(currDef)),
          ruleStack: newRuleStack,
          occurrenceStack: newOccurrenceStack,
        }
        possiblePaths.push(nextPath)
      } else if (prod instanceof Option) {
        // the order of alternatives is meaningful, FILO (Last path will be traversed first).
        const nextPathWithout = {
          idx: currIdx,
          def: drop(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWithout)
        // required marker to avoid backtracking paths whose higher priority alternatives already matched
        possiblePaths.push(EXIT_ALTERNATIVE)
        const nextPathWith = {
          idx: currIdx,
          def: prod.definition.concat(drop(currDef)),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWith)
      } else if (prod instanceof RepetitionMandatory) {
        // TODO:(THE NEW operators here take a while...) (convert once?)
        const secondIteration = new Repetition({
          definition: prod.definition,
          idx: prod.idx,
        })
        const nextDef = prod.definition.concat([secondIteration], drop(currDef))
        const nextPath = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPath)
      } else if (prod instanceof RepetitionMandatoryWithSeparator) {
        // TODO:(THE NEW operators here take a while...) (convert once?)
        const separatorGast = new Terminal({
          terminalType: prod.separator,
        })
        const secondIteration = new Repetition({
          definition: [separatorGast].concat(prod.definition),
          idx: prod.idx,
        })
        const nextDef = prod.definition.concat([secondIteration], drop(currDef))
        const nextPath = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPath)
      } else if (prod instanceof RepetitionWithSeparator) {
        // the order of alternatives is meaningful, FILO (Last path will be traversed first).
        const nextPathWithout = {
          idx: currIdx,
          def: drop(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWithout)
        // required marker to avoid backtracking paths whose higher priority alternatives already matched
        possiblePaths.push(EXIT_ALTERNATIVE)
        const separatorGast = new Terminal({
          terminalType: prod.separator,
        })
        const nthRepetition = new Repetition({
          definition: [separatorGast].concat(prod.definition),
          idx: prod.idx,
        })
        const nextDef = prod.definition.concat([nthRepetition], drop(currDef))
        const nextPathWith = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWith)
      } else if (prod instanceof Repetition) {
        // the order of alternatives is meaningful, FILO (Last path will be traversed first).
        const nextPathWithout = {
          idx: currIdx,
          def: drop(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWithout)
        // required marker to avoid backtracking paths whose higher priority alternatives already matched
        possiblePaths.push(EXIT_ALTERNATIVE)
        // TODO: an empty repetition will cause infinite loops here, will the parser detect this in selfAnalysis?
        const nthRepetition = new Repetition({
          definition: prod.definition,
          idx: prod.idx,
        })
        const nextDef = prod.definition.concat([nthRepetition], drop(currDef))
        const nextPathWith = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        }
        possiblePaths.push(nextPathWith)
      } else if (prod instanceof Alternation) {
        // the order of alternatives is meaningful, FILO (Last path will be traversed first).
        for (let i = prod.definition.length - 1; i >= 0; i--) {
          const currAlt = prod.definition[i]
          const currAltPath = {
            idx: currIdx,
            def: currAlt.definition.concat(drop(currDef)),
            ruleStack: currRuleStack,
            occurrenceStack: currOccurrenceStack,
          }
          possiblePaths.push(currAltPath)
          possiblePaths.push(EXIT_ALTERNATIVE)
        }
      } else if (prod instanceof Alternative) {
        possiblePaths.push({
          idx: currIdx,
          def: prod.definition.concat(drop(currDef)),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack,
        })
      } else if (prod instanceof Rule) {
        // last because we should only encounter at most a single one of these per invocation.
        possiblePaths.push(expandTopLevelRule(prod, currIdx, currRuleStack, currOccurrenceStack))
      } else {
        throw Error('non exhaustive match')
      }
    }
    return result
  }
  function expandTopLevelRule(topRule, currIdx, currRuleStack, currOccurrenceStack) {
    const newRuleStack = clone(currRuleStack)
    newRuleStack.push(topRule.name)
    const newCurrOccurrenceStack = clone(currOccurrenceStack)
    // top rule is always assumed to have been called with occurrence index 1
    newCurrOccurrenceStack.push(1)
    return {
      idx: currIdx,
      def: topRule.definition,
      ruleStack: newRuleStack,
      occurrenceStack: newCurrOccurrenceStack,
    }
  }

  var PROD_TYPE
  ;(function (PROD_TYPE) {
    PROD_TYPE[(PROD_TYPE['OPTION'] = 0)] = 'OPTION'
    PROD_TYPE[(PROD_TYPE['REPETITION'] = 1)] = 'REPETITION'
    PROD_TYPE[(PROD_TYPE['REPETITION_MANDATORY'] = 2)] = 'REPETITION_MANDATORY'
    PROD_TYPE[(PROD_TYPE['REPETITION_MANDATORY_WITH_SEPARATOR'] = 3)] = 'REPETITION_MANDATORY_WITH_SEPARATOR'
    PROD_TYPE[(PROD_TYPE['REPETITION_WITH_SEPARATOR'] = 4)] = 'REPETITION_WITH_SEPARATOR'
    PROD_TYPE[(PROD_TYPE['ALTERNATION'] = 5)] = 'ALTERNATION'
  })(PROD_TYPE || (PROD_TYPE = {}))
  function getProdType(prod) {
    /* istanbul ignore else */
    if (prod instanceof Option || prod === 'Option') {
      return PROD_TYPE.OPTION
    } else if (prod instanceof Repetition || prod === 'Repetition') {
      return PROD_TYPE.REPETITION
    } else if (prod instanceof RepetitionMandatory || prod === 'RepetitionMandatory') {
      return PROD_TYPE.REPETITION_MANDATORY
    } else if (prod instanceof RepetitionMandatoryWithSeparator || prod === 'RepetitionMandatoryWithSeparator') {
      return PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR
    } else if (prod instanceof RepetitionWithSeparator || prod === 'RepetitionWithSeparator') {
      return PROD_TYPE.REPETITION_WITH_SEPARATOR
    } else if (prod instanceof Alternation || prod === 'Alternation') {
      return PROD_TYPE.ALTERNATION
    } else {
      throw Error('non exhaustive match')
    }
  }
  function buildLookaheadFuncForOr(
    occurrence,
    ruleGrammar,
    maxLookahead,
    hasPredicates,
    dynamicTokensEnabled,
    laFuncBuilder,
  ) {
    const lookAheadPaths = getLookaheadPathsForOr(occurrence, ruleGrammar, maxLookahead)
    const tokenMatcher = areTokenCategoriesNotUsed(lookAheadPaths)
      ? tokenStructuredMatcherNoCategories
      : tokenStructuredMatcher
    return laFuncBuilder(lookAheadPaths, hasPredicates, tokenMatcher, dynamicTokensEnabled)
  }
  /**
   *  When dealing with an Optional production (OPTION/MANY/2nd iteration of AT_LEAST_ONE/...) we need to compare
   *  the lookahead "inside" the production and the lookahead immediately "after" it in the same top level rule (context free).
   *
   *  Example: given a production:
   *  ABC(DE)?DF
   *
   *  The optional '(DE)?' should only be entered if we see 'DE'. a single Token 'D' is not sufficient to distinguish between the two
   *  alternatives.
   *
   *  @returns A Lookahead function which will return true IFF the parser should parse the Optional production.
   */
  function buildLookaheadFuncForOptionalProd(
    occurrence,
    ruleGrammar,
    k,
    dynamicTokensEnabled,
    prodType,
    lookaheadBuilder,
  ) {
    const lookAheadPaths = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k)
    const tokenMatcher = areTokenCategoriesNotUsed(lookAheadPaths)
      ? tokenStructuredMatcherNoCategories
      : tokenStructuredMatcher
    return lookaheadBuilder(lookAheadPaths[0], tokenMatcher, dynamicTokensEnabled)
  }
  function buildAlternativesLookAheadFunc(alts, hasPredicates, tokenMatcher, dynamicTokensEnabled) {
    const numOfAlts = alts.length
    const areAllOneTokenLookahead = every(alts, (currAlt) => {
      return every(currAlt, (currPath) => {
        return currPath.length === 1
      })
    })
    // This version takes into account the predicates as well.
    if (hasPredicates) {
      /**
       * @returns {number} - The chosen alternative index
       */
      return function (orAlts) {
        // unfortunately the predicates must be extracted every single time
        // as they cannot be cached due to references to parameters(vars) which are no longer valid.
        // note that in the common case of no predicates, no cpu time will be wasted on this (see else block)
        const predicates = map(orAlts, (currAlt) => currAlt.GATE)
        for (let t = 0; t < numOfAlts; t++) {
          const currAlt = alts[t]
          const currNumOfPaths = currAlt.length
          const currPredicate = predicates[t]
          if (currPredicate !== undefined && currPredicate.call(this) === false) {
            // if the predicate does not match there is no point in checking the paths
            continue
          }
          nextPath: for (let j = 0; j < currNumOfPaths; j++) {
            const currPath = currAlt[j]
            const currPathLength = currPath.length
            for (let i = 0; i < currPathLength; i++) {
              const nextToken = this.LA(i + 1)
              if (tokenMatcher(nextToken, currPath[i]) === false) {
                // mismatch in current path
                // try the next pth
                continue nextPath
              }
            }
            // found a full path that matches.
            // this will also work for an empty ALT as the loop will be skipped
            return t
          }
          // none of the paths for the current alternative matched
          // try the next alternative
        }
        // none of the alternatives could be matched
        return undefined
      }
    } else if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
      // optimized (common) case of all the lookaheads paths requiring only
      // a single token lookahead. These Optimizations cannot work if dynamically defined Tokens are used.
      const singleTokenAlts = map(alts, (currAlt) => {
        return flatten(currAlt)
      })
      const choiceToAlt = reduce(
        singleTokenAlts,
        (result, currAlt, idx) => {
          forEach(currAlt, (currTokType) => {
            if (!has(result, currTokType.tokenTypeIdx)) {
              result[currTokType.tokenTypeIdx] = idx
            }
            forEach(currTokType.categoryMatches, (currExtendingType) => {
              if (!has(result, currExtendingType)) {
                result[currExtendingType] = idx
              }
            })
          })
          return result
        },
        {},
      )
      /**
       * @returns {number} - The chosen alternative index
       */
      return function () {
        const nextToken = this.LA(1)
        return choiceToAlt[nextToken.tokenTypeIdx]
      }
    } else {
      // optimized lookahead without needing to check the predicates at all.
      // this causes code duplication which is intentional to improve performance.
      /**
       * @returns {number} - The chosen alternative index
       */
      return function () {
        for (let t = 0; t < numOfAlts; t++) {
          const currAlt = alts[t]
          const currNumOfPaths = currAlt.length
          nextPath: for (let j = 0; j < currNumOfPaths; j++) {
            const currPath = currAlt[j]
            const currPathLength = currPath.length
            for (let i = 0; i < currPathLength; i++) {
              const nextToken = this.LA(i + 1)
              if (tokenMatcher(nextToken, currPath[i]) === false) {
                // mismatch in current path
                // try the next pth
                continue nextPath
              }
            }
            // found a full path that matches.
            // this will also work for an empty ALT as the loop will be skipped
            return t
          }
          // none of the paths for the current alternative matched
          // try the next alternative
        }
        // none of the alternatives could be matched
        return undefined
      }
    }
  }
  function buildSingleAlternativeLookaheadFunction(alt, tokenMatcher, dynamicTokensEnabled) {
    const areAllOneTokenLookahead = every(alt, (currPath) => {
      return currPath.length === 1
    })
    const numOfPaths = alt.length
    // optimized (common) case of all the lookaheads paths requiring only
    // a single token lookahead.
    if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
      const singleTokensTypes = flatten(alt)
      if (singleTokensTypes.length === 1 && isEmpty(singleTokensTypes[0].categoryMatches)) {
        const expectedTokenType = singleTokensTypes[0]
        const expectedTokenUniqueKey = expectedTokenType.tokenTypeIdx
        return function () {
          return this.LA(1).tokenTypeIdx === expectedTokenUniqueKey
        }
      } else {
        const choiceToAlt = reduce(
          singleTokensTypes,
          (result, currTokType, idx) => {
            result[currTokType.tokenTypeIdx] = true
            forEach(currTokType.categoryMatches, (currExtendingType) => {
              result[currExtendingType] = true
            })
            return result
          },
          [],
        )
        return function () {
          const nextToken = this.LA(1)
          return choiceToAlt[nextToken.tokenTypeIdx] === true
        }
      }
    } else {
      return function () {
        nextPath: for (let j = 0; j < numOfPaths; j++) {
          const currPath = alt[j]
          const currPathLength = currPath.length
          for (let i = 0; i < currPathLength; i++) {
            const nextToken = this.LA(i + 1)
            if (tokenMatcher(nextToken, currPath[i]) === false) {
              // mismatch in current path
              // try the next pth
              continue nextPath
            }
          }
          // found a full path that matches.
          return true
        }
        // none of the paths matched
        return false
      }
    }
  }
  class RestDefinitionFinderWalker extends RestWalker {
    constructor(topProd, targetOccurrence, targetProdType) {
      super()
      this.topProd = topProd
      this.targetOccurrence = targetOccurrence
      this.targetProdType = targetProdType
    }
    startWalking() {
      this.walk(this.topProd)
      return this.restDef
    }
    checkIsTarget(node, expectedProdType, currRest, prevRest) {
      if (node.idx === this.targetOccurrence && this.targetProdType === expectedProdType) {
        this.restDef = currRest.concat(prevRest)
        return true
      }
      // performance optimization, do not iterate over the entire Grammar ast after we have found the target
      return false
    }
    walkOption(optionProd, currRest, prevRest) {
      if (!this.checkIsTarget(optionProd, PROD_TYPE.OPTION, currRest, prevRest)) {
        super.walkOption(optionProd, currRest, prevRest)
      }
    }
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      if (!this.checkIsTarget(atLeastOneProd, PROD_TYPE.REPETITION_MANDATORY, currRest, prevRest)) {
        super.walkOption(atLeastOneProd, currRest, prevRest)
      }
    }
    walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
      if (!this.checkIsTarget(atLeastOneSepProd, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, currRest, prevRest)) {
        super.walkOption(atLeastOneSepProd, currRest, prevRest)
      }
    }
    walkMany(manyProd, currRest, prevRest) {
      if (!this.checkIsTarget(manyProd, PROD_TYPE.REPETITION, currRest, prevRest)) {
        super.walkOption(manyProd, currRest, prevRest)
      }
    }
    walkManySep(manySepProd, currRest, prevRest) {
      if (!this.checkIsTarget(manySepProd, PROD_TYPE.REPETITION_WITH_SEPARATOR, currRest, prevRest)) {
        super.walkOption(manySepProd, currRest, prevRest)
      }
    }
  }
  /**
   * Returns the definition of a target production in a top level level rule.
   */
  class InsideDefinitionFinderVisitor extends GAstVisitor {
    constructor(targetOccurrence, targetProdType, targetRef) {
      super()
      this.targetOccurrence = targetOccurrence
      this.targetProdType = targetProdType
      this.targetRef = targetRef
      this.result = []
    }
    checkIsTarget(node, expectedProdName) {
      if (
        node.idx === this.targetOccurrence &&
        this.targetProdType === expectedProdName &&
        (this.targetRef === undefined || node === this.targetRef)
      ) {
        this.result = node.definition
      }
    }
    visitOption(node) {
      this.checkIsTarget(node, PROD_TYPE.OPTION)
    }
    visitRepetition(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION)
    }
    visitRepetitionMandatory(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY)
    }
    visitRepetitionMandatoryWithSeparator(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR)
    }
    visitRepetitionWithSeparator(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_WITH_SEPARATOR)
    }
    visitAlternation(node) {
      this.checkIsTarget(node, PROD_TYPE.ALTERNATION)
    }
  }
  function initializeArrayOfArrays(size) {
    const result = new Array(size)
    for (let i = 0; i < size; i++) {
      result[i] = []
    }
    return result
  }
  /**
   * A sort of hash function between a Path in the grammar and a string.
   * Note that this returns multiple "hashes" to support the scenario of token categories.
   * -  A single path with categories may match multiple **actual** paths.
   */
  function pathToHashKeys(path) {
    let keys = ['']
    for (let i = 0; i < path.length; i++) {
      const tokType = path[i]
      const longerKeys = []
      for (let j = 0; j < keys.length; j++) {
        const currShorterKey = keys[j]
        longerKeys.push(currShorterKey + '_' + tokType.tokenTypeIdx)
        for (let t = 0; t < tokType.categoryMatches.length; t++) {
          const categoriesKeySuffix = '_' + tokType.categoryMatches[t]
          longerKeys.push(currShorterKey + categoriesKeySuffix)
        }
      }
      keys = longerKeys
    }
    return keys
  }
  /**
   * Imperative style due to being called from a hot spot
   */
  function isUniquePrefixHash(altKnownPathsKeys, searchPathKeys, idx) {
    for (let currAltIdx = 0; currAltIdx < altKnownPathsKeys.length; currAltIdx++) {
      // We only want to test vs the other alternatives
      if (currAltIdx === idx) {
        continue
      }
      const otherAltKnownPathsKeys = altKnownPathsKeys[currAltIdx]
      for (let searchIdx = 0; searchIdx < searchPathKeys.length; searchIdx++) {
        const searchKey = searchPathKeys[searchIdx]
        if (otherAltKnownPathsKeys[searchKey] === true) {
          return false
        }
      }
    }
    // None of the SearchPathKeys were found in any of the other alternatives
    return true
  }
  function lookAheadSequenceFromAlternatives(altsDefs, k) {
    const partialAlts = map(altsDefs, (currAlt) => possiblePathsFrom([currAlt], 1))
    const finalResult = initializeArrayOfArrays(partialAlts.length)
    const altsHashes = map(partialAlts, (currAltPaths) => {
      const dict = {}
      forEach(currAltPaths, (item) => {
        const keys = pathToHashKeys(item.partialPath)
        forEach(keys, (currKey) => {
          dict[currKey] = true
        })
      })
      return dict
    })
    let newData = partialAlts
    // maxLookahead loop
    for (let pathLength = 1; pathLength <= k; pathLength++) {
      const currDataset = newData
      newData = initializeArrayOfArrays(currDataset.length)
      // alternatives loop
      for (let altIdx = 0; altIdx < currDataset.length; altIdx++) {
        const currAltPathsAndSuffixes = currDataset[altIdx]
        // paths in current alternative loop
        for (let currPathIdx = 0; currPathIdx < currAltPathsAndSuffixes.length; currPathIdx++) {
          const currPathPrefix = currAltPathsAndSuffixes[currPathIdx].partialPath
          const suffixDef = currAltPathsAndSuffixes[currPathIdx].suffixDef
          const prefixKeys = pathToHashKeys(currPathPrefix)
          const isUnique = isUniquePrefixHash(altsHashes, prefixKeys, altIdx)
          // End of the line for this path.
          if (isUnique || isEmpty(suffixDef) || currPathPrefix.length === k) {
            const currAltResult = finalResult[altIdx]
            // TODO: Can we implement a containsPath using Maps/Dictionaries?
            if (containsPath(currAltResult, currPathPrefix) === false) {
              currAltResult.push(currPathPrefix)
              // Update all new  keys for the current path.
              for (let j = 0; j < prefixKeys.length; j++) {
                const currKey = prefixKeys[j]
                altsHashes[altIdx][currKey] = true
              }
            }
          }
          // Expand longer paths
          else {
            const newPartialPathsAndSuffixes = possiblePathsFrom(suffixDef, pathLength + 1, currPathPrefix)
            newData[altIdx] = newData[altIdx].concat(newPartialPathsAndSuffixes)
            // Update keys for new known paths
            forEach(newPartialPathsAndSuffixes, (item) => {
              const prefixKeys = pathToHashKeys(item.partialPath)
              forEach(prefixKeys, (key) => {
                altsHashes[altIdx][key] = true
              })
            })
          }
        }
      }
    }
    return finalResult
  }
  function getLookaheadPathsForOr(occurrence, ruleGrammar, k, orProd) {
    const visitor = new InsideDefinitionFinderVisitor(occurrence, PROD_TYPE.ALTERNATION, orProd)
    ruleGrammar.accept(visitor)
    return lookAheadSequenceFromAlternatives(visitor.result, k)
  }
  function getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k) {
    const insideDefVisitor = new InsideDefinitionFinderVisitor(occurrence, prodType)
    ruleGrammar.accept(insideDefVisitor)
    const insideDef = insideDefVisitor.result
    const afterDefWalker = new RestDefinitionFinderWalker(ruleGrammar, occurrence, prodType)
    const afterDef = afterDefWalker.startWalking()
    const insideFlat = new Alternative({ definition: insideDef })
    const afterFlat = new Alternative({ definition: afterDef })
    return lookAheadSequenceFromAlternatives([insideFlat, afterFlat], k)
  }
  function containsPath(alternative, searchPath) {
    compareOtherPath: for (let i = 0; i < alternative.length; i++) {
      const otherPath = alternative[i]
      if (otherPath.length !== searchPath.length) {
        continue
      }
      for (let j = 0; j < otherPath.length; j++) {
        const searchTok = searchPath[j]
        const otherTok = otherPath[j]
        const matchingTokens =
          searchTok === otherTok || otherTok.categoryMatchesMap[searchTok.tokenTypeIdx] !== undefined
        if (matchingTokens === false) {
          continue compareOtherPath
        }
      }
      return true
    }
    return false
  }
  function isStrictPrefixOfPath(prefix, other) {
    return (
      prefix.length < other.length &&
      every(prefix, (tokType, idx) => {
        const otherTokType = other[idx]
        return tokType === otherTokType || otherTokType.categoryMatchesMap[tokType.tokenTypeIdx]
      })
    )
  }
  function areTokenCategoriesNotUsed(lookAheadPaths) {
    return every(lookAheadPaths, (singleAltPaths) =>
      every(singleAltPaths, (singlePath) => every(singlePath, (token) => isEmpty(token.categoryMatches))),
    )
  }

  function validateLookahead(options) {
    const lookaheadValidationErrorMessages = options.lookaheadStrategy.validate({
      rules: options.rules,
      tokenTypes: options.tokenTypes,
      grammarName: options.grammarName,
    })
    return map(lookaheadValidationErrorMessages, (errorMessage) =>
      Object.assign({ type: ParserDefinitionErrorType.CUSTOM_LOOKAHEAD_VALIDATION }, errorMessage),
    )
  }
  function validateGrammar$1(topLevels, tokenTypes, errMsgProvider, grammarName) {
    const duplicateErrors = flatMap(topLevels, (currTopLevel) =>
      validateDuplicateProductions(currTopLevel, errMsgProvider),
    )
    const termsNamespaceConflictErrors = checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider)
    const tooManyAltsErrors = flatMap(topLevels, (curRule) => validateTooManyAlts(curRule, errMsgProvider))
    const duplicateRulesError = flatMap(topLevels, (curRule) =>
      validateRuleDoesNotAlreadyExist(curRule, topLevels, grammarName, errMsgProvider),
    )
    return duplicateErrors.concat(termsNamespaceConflictErrors, tooManyAltsErrors, duplicateRulesError)
  }
  function validateDuplicateProductions(topLevelRule, errMsgProvider) {
    const collectorVisitor = new OccurrenceValidationCollector()
    topLevelRule.accept(collectorVisitor)
    const allRuleProductions = collectorVisitor.allProductions
    const productionGroups = groupBy$1(allRuleProductions, identifyProductionForDuplicates)
    const duplicates = pickBy(productionGroups, (currGroup) => {
      return currGroup.length > 1
    })
    const errors = map(values(duplicates), (currDuplicates) => {
      const firstProd = head(currDuplicates)
      const msg = errMsgProvider.buildDuplicateFoundError(topLevelRule, currDuplicates)
      const dslName = getProductionDslName(firstProd)
      const defError = {
        message: msg,
        type: ParserDefinitionErrorType.DUPLICATE_PRODUCTIONS,
        ruleName: topLevelRule.name,
        dslName: dslName,
        occurrence: firstProd.idx,
      }
      const param = getExtraProductionArgument(firstProd)
      if (param) {
        defError.parameter = param
      }
      return defError
    })
    return errors
  }
  function identifyProductionForDuplicates(prod) {
    return `${getProductionDslName(prod)}_#_${prod.idx}_#_${getExtraProductionArgument(prod)}`
  }
  function getExtraProductionArgument(prod) {
    if (prod instanceof Terminal) {
      return prod.terminalType.name
    } else if (prod instanceof NonTerminal) {
      return prod.nonTerminalName
    } else {
      return ''
    }
  }
  class OccurrenceValidationCollector extends GAstVisitor {
    constructor() {
      super(...arguments)
      this.allProductions = []
    }
    visitNonTerminal(subrule) {
      this.allProductions.push(subrule)
    }
    visitOption(option) {
      this.allProductions.push(option)
    }
    visitRepetitionWithSeparator(manySep) {
      this.allProductions.push(manySep)
    }
    visitRepetitionMandatory(atLeastOne) {
      this.allProductions.push(atLeastOne)
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.allProductions.push(atLeastOneSep)
    }
    visitRepetition(many) {
      this.allProductions.push(many)
    }
    visitAlternation(or) {
      this.allProductions.push(or)
    }
    visitTerminal(terminal) {
      this.allProductions.push(terminal)
    }
  }
  function validateRuleDoesNotAlreadyExist(rule, allRules, className, errMsgProvider) {
    const errors = []
    const occurrences = reduce(
      allRules,
      (result, curRule) => {
        if (curRule.name === rule.name) {
          return result + 1
        }
        return result
      },
      0,
    )
    if (occurrences > 1) {
      const errMsg = errMsgProvider.buildDuplicateRuleNameError({
        topLevelRule: rule,
        grammarName: className,
      })
      errors.push({
        message: errMsg,
        type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
        ruleName: rule.name,
      })
    }
    return errors
  }
  // TODO: is there anyway to get only the rule names of rules inherited from the super grammars?
  // This is not part of the IGrammarErrorProvider because the validation cannot be performed on
  // The grammar structure, only at runtime.
  function validateRuleIsOverridden(ruleName, definedRulesNames, className) {
    const errors = []
    let errMsg
    if (!includes(definedRulesNames, ruleName)) {
      errMsg =
        `Invalid rule override, rule: ->${ruleName}<- cannot be overridden in the grammar: ->${className}<-` +
        `as it is not defined in any of the super grammars `
      errors.push({
        message: errMsg,
        type: ParserDefinitionErrorType.INVALID_RULE_OVERRIDE,
        ruleName: ruleName,
      })
    }
    return errors
  }
  function validateNoLeftRecursion(topRule, currRule, errMsgProvider, path = []) {
    const errors = []
    const nextNonTerminals = getFirstNoneTerminal(currRule.definition)
    if (isEmpty(nextNonTerminals)) {
      return []
    } else {
      const ruleName = topRule.name
      const foundLeftRecursion = includes(nextNonTerminals, topRule)
      if (foundLeftRecursion) {
        errors.push({
          message: errMsgProvider.buildLeftRecursionError({
            topLevelRule: topRule,
            leftRecursionPath: path,
          }),
          type: ParserDefinitionErrorType.LEFT_RECURSION,
          ruleName: ruleName,
        })
      }
      // we are only looking for cyclic paths leading back to the specific topRule
      // other cyclic paths are ignored, we still need this difference to avoid infinite loops...
      const validNextSteps = difference$1(nextNonTerminals, path.concat([topRule]))
      const errorsFromNextSteps = flatMap(validNextSteps, (currRefRule) => {
        const newPath = clone(path)
        newPath.push(currRefRule)
        return validateNoLeftRecursion(topRule, currRefRule, errMsgProvider, newPath)
      })
      return errors.concat(errorsFromNextSteps)
    }
  }
  function getFirstNoneTerminal(definition) {
    let result = []
    if (isEmpty(definition)) {
      return result
    }
    const firstProd = head(definition)
    /* istanbul ignore else */
    if (firstProd instanceof NonTerminal) {
      result.push(firstProd.referencedRule)
    } else if (
      firstProd instanceof Alternative ||
      firstProd instanceof Option ||
      firstProd instanceof RepetitionMandatory ||
      firstProd instanceof RepetitionMandatoryWithSeparator ||
      firstProd instanceof RepetitionWithSeparator ||
      firstProd instanceof Repetition
    ) {
      result = result.concat(getFirstNoneTerminal(firstProd.definition))
    } else if (firstProd instanceof Alternation) {
      // each sub definition in alternation is a FLAT
      result = flatten(map(firstProd.definition, (currSubDef) => getFirstNoneTerminal(currSubDef.definition)))
    } else if (firstProd instanceof Terminal);
    else {
      throw Error('non exhaustive match')
    }
    const isFirstOptional = isOptionalProd(firstProd)
    const hasMore = definition.length > 1
    if (isFirstOptional && hasMore) {
      const rest = drop(definition)
      return result.concat(getFirstNoneTerminal(rest))
    } else {
      return result
    }
  }
  class OrCollector extends GAstVisitor {
    constructor() {
      super(...arguments)
      this.alternations = []
    }
    visitAlternation(node) {
      this.alternations.push(node)
    }
  }
  function validateEmptyOrAlternative(topLevelRule, errMsgProvider) {
    const orCollector = new OrCollector()
    topLevelRule.accept(orCollector)
    const ors = orCollector.alternations
    const errors = flatMap(ors, (currOr) => {
      const exceptLast = dropRight(currOr.definition)
      return flatMap(exceptLast, (currAlternative, currAltIdx) => {
        const possibleFirstInAlt = nextPossibleTokensAfter([currAlternative], [], tokenStructuredMatcher, 1)
        if (isEmpty(possibleFirstInAlt)) {
          return [
            {
              message: errMsgProvider.buildEmptyAlternationError({
                topLevelRule: topLevelRule,
                alternation: currOr,
                emptyChoiceIdx: currAltIdx,
              }),
              type: ParserDefinitionErrorType.NONE_LAST_EMPTY_ALT,
              ruleName: topLevelRule.name,
              occurrence: currOr.idx,
              alternative: currAltIdx + 1,
            },
          ]
        } else {
          return []
        }
      })
    })
    return errors
  }
  function validateAmbiguousAlternationAlternatives(topLevelRule, globalMaxLookahead, errMsgProvider) {
    const orCollector = new OrCollector()
    topLevelRule.accept(orCollector)
    let ors = orCollector.alternations
    // New Handling of ignoring ambiguities
    // - https://github.com/chevrotain/chevrotain/issues/869
    ors = reject(ors, (currOr) => currOr.ignoreAmbiguities === true)
    const errors = flatMap(ors, (currOr) => {
      const currOccurrence = currOr.idx
      const actualMaxLookahead = currOr.maxLookahead || globalMaxLookahead
      const alternatives = getLookaheadPathsForOr(currOccurrence, topLevelRule, actualMaxLookahead, currOr)
      const altsAmbiguityErrors = checkAlternativesAmbiguities(alternatives, currOr, topLevelRule, errMsgProvider)
      const altsPrefixAmbiguityErrors = checkPrefixAlternativesAmbiguities(
        alternatives,
        currOr,
        topLevelRule,
        errMsgProvider,
      )
      return altsAmbiguityErrors.concat(altsPrefixAmbiguityErrors)
    })
    return errors
  }
  class RepetitionCollector extends GAstVisitor {
    constructor() {
      super(...arguments)
      this.allProductions = []
    }
    visitRepetitionWithSeparator(manySep) {
      this.allProductions.push(manySep)
    }
    visitRepetitionMandatory(atLeastOne) {
      this.allProductions.push(atLeastOne)
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.allProductions.push(atLeastOneSep)
    }
    visitRepetition(many) {
      this.allProductions.push(many)
    }
  }
  function validateTooManyAlts(topLevelRule, errMsgProvider) {
    const orCollector = new OrCollector()
    topLevelRule.accept(orCollector)
    const ors = orCollector.alternations
    const errors = flatMap(ors, (currOr) => {
      if (currOr.definition.length > 255) {
        return [
          {
            message: errMsgProvider.buildTooManyAlternativesError({
              topLevelRule: topLevelRule,
              alternation: currOr,
            }),
            type: ParserDefinitionErrorType.TOO_MANY_ALTS,
            ruleName: topLevelRule.name,
            occurrence: currOr.idx,
          },
        ]
      } else {
        return []
      }
    })
    return errors
  }
  function validateSomeNonEmptyLookaheadPath(topLevelRules, maxLookahead, errMsgProvider) {
    const errors = []
    forEach(topLevelRules, (currTopRule) => {
      const collectorVisitor = new RepetitionCollector()
      currTopRule.accept(collectorVisitor)
      const allRuleProductions = collectorVisitor.allProductions
      forEach(allRuleProductions, (currProd) => {
        const prodType = getProdType(currProd)
        const actualMaxLookahead = currProd.maxLookahead || maxLookahead
        const currOccurrence = currProd.idx
        const paths = getLookaheadPathsForOptionalProd(currOccurrence, currTopRule, prodType, actualMaxLookahead)
        const pathsInsideProduction = paths[0]
        if (isEmpty(flatten(pathsInsideProduction))) {
          const errMsg = errMsgProvider.buildEmptyRepetitionError({
            topLevelRule: currTopRule,
            repetition: currProd,
          })
          errors.push({
            message: errMsg,
            type: ParserDefinitionErrorType.NO_NON_EMPTY_LOOKAHEAD,
            ruleName: currTopRule.name,
          })
        }
      })
    })
    return errors
  }
  function checkAlternativesAmbiguities(alternatives, alternation, rule, errMsgProvider) {
    const foundAmbiguousPaths = []
    const identicalAmbiguities = reduce(
      alternatives,
      (result, currAlt, currAltIdx) => {
        // ignore (skip) ambiguities with this alternative
        if (alternation.definition[currAltIdx].ignoreAmbiguities === true) {
          return result
        }
        forEach(currAlt, (currPath) => {
          const altsCurrPathAppearsIn = [currAltIdx]
          forEach(alternatives, (currOtherAlt, currOtherAltIdx) => {
            if (
              currAltIdx !== currOtherAltIdx &&
              containsPath(currOtherAlt, currPath) &&
              // ignore (skip) ambiguities with this "other" alternative
              alternation.definition[currOtherAltIdx].ignoreAmbiguities !== true
            ) {
              altsCurrPathAppearsIn.push(currOtherAltIdx)
            }
          })
          if (altsCurrPathAppearsIn.length > 1 && !containsPath(foundAmbiguousPaths, currPath)) {
            foundAmbiguousPaths.push(currPath)
            result.push({
              alts: altsCurrPathAppearsIn,
              path: currPath,
            })
          }
        })
        return result
      },
      [],
    )
    const currErrors = map(identicalAmbiguities, (currAmbDescriptor) => {
      const ambgIndices = map(currAmbDescriptor.alts, (currAltIdx) => currAltIdx + 1)
      const currMessage = errMsgProvider.buildAlternationAmbiguityError({
        topLevelRule: rule,
        alternation: alternation,
        ambiguityIndices: ambgIndices,
        prefixPath: currAmbDescriptor.path,
      })
      return {
        message: currMessage,
        type: ParserDefinitionErrorType.AMBIGUOUS_ALTS,
        ruleName: rule.name,
        occurrence: alternation.idx,
        alternatives: currAmbDescriptor.alts,
      }
    })
    return currErrors
  }
  function checkPrefixAlternativesAmbiguities(alternatives, alternation, rule, errMsgProvider) {
    // flatten
    const pathsAndIndices = reduce(
      alternatives,
      (result, currAlt, idx) => {
        const currPathsAndIdx = map(currAlt, (currPath) => {
          return { idx: idx, path: currPath }
        })
        return result.concat(currPathsAndIdx)
      },
      [],
    )
    const errors = compact(
      flatMap(pathsAndIndices, (currPathAndIdx) => {
        const alternativeGast = alternation.definition[currPathAndIdx.idx]
        // ignore (skip) ambiguities with this alternative
        if (alternativeGast.ignoreAmbiguities === true) {
          return []
        }
        const targetIdx = currPathAndIdx.idx
        const targetPath = currPathAndIdx.path
        const prefixAmbiguitiesPathsAndIndices = filter(pathsAndIndices, (searchPathAndIdx) => {
          // prefix ambiguity can only be created from lower idx (higher priority) path
          return (
            // ignore (skip) ambiguities with this "other" alternative
            alternation.definition[searchPathAndIdx.idx].ignoreAmbiguities !== true &&
            searchPathAndIdx.idx < targetIdx &&
            // checking for strict prefix because identical lookaheads
            // will be be detected using a different validation.
            isStrictPrefixOfPath(searchPathAndIdx.path, targetPath)
          )
        })
        const currPathPrefixErrors = map(prefixAmbiguitiesPathsAndIndices, (currAmbPathAndIdx) => {
          const ambgIndices = [currAmbPathAndIdx.idx + 1, targetIdx + 1]
          const occurrence = alternation.idx === 0 ? '' : alternation.idx
          const message = errMsgProvider.buildAlternationPrefixAmbiguityError({
            topLevelRule: rule,
            alternation: alternation,
            ambiguityIndices: ambgIndices,
            prefixPath: currAmbPathAndIdx.path,
          })
          return {
            message: message,
            type: ParserDefinitionErrorType.AMBIGUOUS_PREFIX_ALTS,
            ruleName: rule.name,
            occurrence: occurrence,
            alternatives: ambgIndices,
          }
        })
        return currPathPrefixErrors
      }),
    )
    return errors
  }
  function checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider) {
    const errors = []
    const tokenNames = map(tokenTypes, (currToken) => currToken.name)
    forEach(topLevels, (currRule) => {
      const currRuleName = currRule.name
      if (includes(tokenNames, currRuleName)) {
        const errMsg = errMsgProvider.buildNamespaceConflictError(currRule)
        errors.push({
          message: errMsg,
          type: ParserDefinitionErrorType.CONFLICT_TOKENS_RULES_NAMESPACE,
          ruleName: currRuleName,
        })
      }
    })
    return errors
  }

  function resolveGrammar(options) {
    const actualOptions = defaults$1(options, {
      errMsgProvider: defaultGrammarResolverErrorProvider,
    })
    const topRulesTable = {}
    forEach(options.rules, (rule) => {
      topRulesTable[rule.name] = rule
    })
    return resolveGrammar$1(topRulesTable, actualOptions.errMsgProvider)
  }
  function validateGrammar(options) {
    options = defaults$1(options, {
      errMsgProvider: defaultGrammarValidatorErrorProvider,
    })
    return validateGrammar$1(options.rules, options.tokenTypes, options.errMsgProvider, options.grammarName)
  }

  const MISMATCHED_TOKEN_EXCEPTION = 'MismatchedTokenException'
  const NO_VIABLE_ALT_EXCEPTION = 'NoViableAltException'
  const EARLY_EXIT_EXCEPTION = 'EarlyExitException'
  const NOT_ALL_INPUT_PARSED_EXCEPTION = 'NotAllInputParsedException'
  const RECOGNITION_EXCEPTION_NAMES = [
    MISMATCHED_TOKEN_EXCEPTION,
    NO_VIABLE_ALT_EXCEPTION,
    EARLY_EXIT_EXCEPTION,
    NOT_ALL_INPUT_PARSED_EXCEPTION,
  ]
  Object.freeze(RECOGNITION_EXCEPTION_NAMES)
  // hacks to bypass no support for custom Errors in javascript/typescript
  function isRecognitionException(error) {
    // can't do instanceof on hacked custom js exceptions
    return includes(RECOGNITION_EXCEPTION_NAMES, error.name)
  }
  class RecognitionException extends Error {
    constructor(message, token) {
      super(message)
      this.token = token
      this.resyncedTokens = []
      // fix prototype chain when typescript target is ES5
      Object.setPrototypeOf(this, new.target.prototype)
      /* istanbul ignore next - V8 workaround to remove constructor from stacktrace when typescript target is ES5 */
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor)
      }
    }
  }
  class MismatchedTokenException extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token)
      this.previousToken = previousToken
      this.name = MISMATCHED_TOKEN_EXCEPTION
    }
  }
  class NoViableAltException extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token)
      this.previousToken = previousToken
      this.name = NO_VIABLE_ALT_EXCEPTION
    }
  }
  class NotAllInputParsedException extends RecognitionException {
    constructor(message, token) {
      super(message, token)
      this.name = NOT_ALL_INPUT_PARSED_EXCEPTION
    }
  }
  class EarlyExitException extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token)
      this.previousToken = previousToken
      this.name = EARLY_EXIT_EXCEPTION
    }
  }

  const EOF_FOLLOW_KEY = {}
  const IN_RULE_RECOVERY_EXCEPTION = 'InRuleRecoveryException'
  class InRuleRecoveryException extends Error {
    constructor(message) {
      super(message)
      this.name = IN_RULE_RECOVERY_EXCEPTION
    }
  }
  /**
   * This trait is responsible for the error recovery and fault tolerant logic
   */
  class Recoverable {
    initRecoverable(config) {
      this.firstAfterRepMap = {}
      this.resyncFollows = {}
      this.recoveryEnabled = has(config, 'recoveryEnabled')
        ? config.recoveryEnabled // assumes end user provides the correct config value/type
        : DEFAULT_PARSER_CONFIG.recoveryEnabled
      // performance optimization, NOOP will be inlined which
      // effectively means that this optional feature does not exist
      // when not used.
      if (this.recoveryEnabled) {
        this.attemptInRepetitionRecovery = attemptInRepetitionRecovery
      }
    }
    getTokenToInsert(tokType) {
      const tokToInsert = createTokenInstance(tokType, '', NaN, NaN, NaN, NaN, NaN, NaN)
      tokToInsert.isInsertedInRecovery = true
      return tokToInsert
    }
    canTokenTypeBeInsertedInRecovery(tokType) {
      return true
    }
    canTokenTypeBeDeletedInRecovery(tokType) {
      return true
    }
    tryInRepetitionRecovery(grammarRule, grammarRuleArgs, lookAheadFunc, expectedTokType) {
      // TODO: can the resyncTokenType be cached?
      const reSyncTokType = this.findReSyncTokenType()
      const savedLexerState = this.exportLexerState()
      const resyncedTokens = []
      let passedResyncPoint = false
      const nextTokenWithoutResync = this.LA(1)
      let currToken = this.LA(1)
      const generateErrorMessage = () => {
        const previousToken = this.LA(0)
        // we are preemptively re-syncing before an error has been detected, therefor we must reproduce
        // the error that would have been thrown
        const msg = this.errorMessageProvider.buildMismatchTokenMessage({
          expected: expectedTokType,
          actual: nextTokenWithoutResync,
          previous: previousToken,
          ruleName: this.getCurrRuleFullName(),
        })
        const error = new MismatchedTokenException(msg, nextTokenWithoutResync, this.LA(0))
        // the first token here will be the original cause of the error, this is not part of the resyncedTokens property.
        error.resyncedTokens = dropRight(resyncedTokens)
        this.SAVE_ERROR(error)
      }
      while (!passedResyncPoint) {
        // re-synced to a point where we can safely exit the repetition/
        if (this.tokenMatcher(currToken, expectedTokType)) {
          generateErrorMessage()
          return // must return here to avoid reverting the inputIdx
        } else if (lookAheadFunc.call(this)) {
          // we skipped enough tokens so we can resync right back into another iteration of the repetition grammar rule
          generateErrorMessage()
          // recursive invocation in other to support multiple re-syncs in the same top level repetition grammar rule
          grammarRule.apply(this, grammarRuleArgs)
          return // must return here to avoid reverting the inputIdx
        } else if (this.tokenMatcher(currToken, reSyncTokType)) {
          passedResyncPoint = true
        } else {
          currToken = this.SKIP_TOKEN()
          this.addToResyncTokens(currToken, resyncedTokens)
        }
      }
      // we were unable to find a CLOSER point to resync inside the Repetition, reset the state.
      // The parsing exception we were trying to prevent will happen in the NEXT parsing step. it may be handled by
      // "between rules" resync recovery later in the flow.
      this.importLexerState(savedLexerState)
    }
    shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck) {
      // Edge case of arriving from a MANY repetition which is stuck
      // Attempting recovery in this case could cause an infinite loop
      if (notStuck === false) {
        return false
      }
      // no need to recover, next token is what we expect...
      if (this.tokenMatcher(this.LA(1), expectTokAfterLastMatch)) {
        return false
      }
      // error recovery is disabled during backtracking as it can make the parser ignore a valid grammar path
      // and prefer some backtracking path that includes recovered errors.
      if (this.isBackTracking()) {
        return false
      }
      // if we can perform inRule recovery (single token insertion or deletion) we always prefer that recovery algorithm
      // because if it works, it makes the least amount of changes to the input stream (greedy algorithm)
      //noinspection RedundantIfStatementJS
      if (
        this.canPerformInRuleRecovery(
          expectTokAfterLastMatch,
          this.getFollowsForInRuleRecovery(expectTokAfterLastMatch, nextTokIdx),
        )
      ) {
        return false
      }
      return true
    }
    // Error Recovery functionality
    getFollowsForInRuleRecovery(tokType, tokIdxInRule) {
      const grammarPath = this.getCurrentGrammarPath(tokType, tokIdxInRule)
      const follows = this.getNextPossibleTokenTypes(grammarPath)
      return follows
    }
    tryInRuleRecovery(expectedTokType, follows) {
      if (this.canRecoverWithSingleTokenInsertion(expectedTokType, follows)) {
        const tokToInsert = this.getTokenToInsert(expectedTokType)
        return tokToInsert
      }
      if (this.canRecoverWithSingleTokenDeletion(expectedTokType)) {
        const nextTok = this.SKIP_TOKEN()
        this.consumeToken()
        return nextTok
      }
      throw new InRuleRecoveryException('sad sad panda')
    }
    canPerformInRuleRecovery(expectedToken, follows) {
      return (
        this.canRecoverWithSingleTokenInsertion(expectedToken, follows) ||
        this.canRecoverWithSingleTokenDeletion(expectedToken)
      )
    }
    canRecoverWithSingleTokenInsertion(expectedTokType, follows) {
      if (!this.canTokenTypeBeInsertedInRecovery(expectedTokType)) {
        return false
      }
      // must know the possible following tokens to perform single token insertion
      if (isEmpty(follows)) {
        return false
      }
      const mismatchedTok = this.LA(1)
      const isMisMatchedTokInFollows =
        find$1(follows, (possibleFollowsTokType) => {
          return this.tokenMatcher(mismatchedTok, possibleFollowsTokType)
        }) !== undefined
      return isMisMatchedTokInFollows
    }
    canRecoverWithSingleTokenDeletion(expectedTokType) {
      if (!this.canTokenTypeBeDeletedInRecovery(expectedTokType)) {
        return false
      }
      const isNextTokenWhatIsExpected = this.tokenMatcher(this.LA(2), expectedTokType)
      return isNextTokenWhatIsExpected
    }
    isInCurrentRuleReSyncSet(tokenTypeIdx) {
      const followKey = this.getCurrFollowKey()
      const currentRuleReSyncSet = this.getFollowSetFromFollowKey(followKey)
      return includes(currentRuleReSyncSet, tokenTypeIdx)
    }
    findReSyncTokenType() {
      const allPossibleReSyncTokTypes = this.flattenFollowSet()
      // this loop will always terminate as EOF is always in the follow stack and also always (virtually) in the input
      let nextToken = this.LA(1)
      let k = 2
      while (true) {
        const foundMatch = find$1(allPossibleReSyncTokTypes, (resyncTokType) => {
          const canMatch = tokenMatcher(nextToken, resyncTokType)
          return canMatch
        })
        if (foundMatch !== undefined) {
          return foundMatch
        }
        nextToken = this.LA(k)
        k++
      }
    }
    getCurrFollowKey() {
      // the length is at least one as we always add the ruleName to the stack before invoking the rule.
      if (this.RULE_STACK.length === 1) {
        return EOF_FOLLOW_KEY
      }
      const currRuleShortName = this.getLastExplicitRuleShortName()
      const currRuleIdx = this.getLastExplicitRuleOccurrenceIndex()
      const prevRuleShortName = this.getPreviousExplicitRuleShortName()
      return {
        ruleName: this.shortRuleNameToFullName(currRuleShortName),
        idxInCallingRule: currRuleIdx,
        inRule: this.shortRuleNameToFullName(prevRuleShortName),
      }
    }
    buildFullFollowKeyStack() {
      const explicitRuleStack = this.RULE_STACK
      const explicitOccurrenceStack = this.RULE_OCCURRENCE_STACK
      return map(explicitRuleStack, (ruleName, idx) => {
        if (idx === 0) {
          return EOF_FOLLOW_KEY
        }
        return {
          ruleName: this.shortRuleNameToFullName(ruleName),
          idxInCallingRule: explicitOccurrenceStack[idx],
          inRule: this.shortRuleNameToFullName(explicitRuleStack[idx - 1]),
        }
      })
    }
    flattenFollowSet() {
      const followStack = map(this.buildFullFollowKeyStack(), (currKey) => {
        return this.getFollowSetFromFollowKey(currKey)
      })
      return flatten(followStack)
    }
    getFollowSetFromFollowKey(followKey) {
      if (followKey === EOF_FOLLOW_KEY) {
        return [EOF]
      }
      const followName = followKey.ruleName + followKey.idxInCallingRule + IN + followKey.inRule
      return this.resyncFollows[followName]
    }
    // It does not make any sense to include a virtual EOF token in the list of resynced tokens
    // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
    addToResyncTokens(token, resyncTokens) {
      if (!this.tokenMatcher(token, EOF)) {
        resyncTokens.push(token)
      }
      return resyncTokens
    }
    reSyncTo(tokType) {
      const resyncedTokens = []
      let nextTok = this.LA(1)
      while (this.tokenMatcher(nextTok, tokType) === false) {
        nextTok = this.SKIP_TOKEN()
        this.addToResyncTokens(nextTok, resyncedTokens)
      }
      // the last token is not part of the error.
      return dropRight(resyncedTokens)
    }
    attemptInRepetitionRecovery(prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker, notStuck) {
      // by default this is a NO-OP
      // The actual implementation is with the function(not method) below
    }
    getCurrentGrammarPath(tokType, tokIdxInRule) {
      const pathRuleStack = this.getHumanReadableRuleStack()
      const pathOccurrenceStack = clone(this.RULE_OCCURRENCE_STACK)
      const grammarPath = {
        ruleStack: pathRuleStack,
        occurrenceStack: pathOccurrenceStack,
        lastTok: tokType,
        lastTokOccurrence: tokIdxInRule,
      }
      return grammarPath
    }
    getHumanReadableRuleStack() {
      return map(this.RULE_STACK, (currShortName) => this.shortRuleNameToFullName(currShortName))
    }
  }
  function attemptInRepetitionRecovery(
    prodFunc,
    args,
    lookaheadFunc,
    dslMethodIdx,
    prodOccurrence,
    nextToksWalker,
    notStuck,
  ) {
    const key = this.getKeyForAutomaticLookahead(dslMethodIdx, prodOccurrence)
    let firstAfterRepInfo = this.firstAfterRepMap[key]
    if (firstAfterRepInfo === undefined) {
      const currRuleName = this.getCurrRuleFullName()
      const ruleGrammar = this.getGAstProductions()[currRuleName]
      const walker = new nextToksWalker(ruleGrammar, prodOccurrence)
      firstAfterRepInfo = walker.startWalking()
      this.firstAfterRepMap[key] = firstAfterRepInfo
    }
    let expectTokAfterLastMatch = firstAfterRepInfo.token
    let nextTokIdx = firstAfterRepInfo.occurrence
    const isEndOfRule = firstAfterRepInfo.isEndOfRule
    // special edge case of a TOP most repetition after which the input should END.
    // this will force an attempt for inRule recovery in that scenario.
    if (this.RULE_STACK.length === 1 && isEndOfRule && expectTokAfterLastMatch === undefined) {
      expectTokAfterLastMatch = EOF
      nextTokIdx = 1
    }
    // We don't have anything to re-sync to...
    // this condition was extracted from `shouldInRepetitionRecoveryBeTried` to act as a type-guard
    if (expectTokAfterLastMatch === undefined || nextTokIdx === undefined) {
      return
    }
    if (this.shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck)) {
      // TODO: performance optimization: instead of passing the original args here, we modify
      // the args param (or create a new one) and make sure the lookahead func is explicitly provided
      // to avoid searching the cache for it once more.
      this.tryInRepetitionRecovery(prodFunc, args, lookaheadFunc, expectTokAfterLastMatch)
    }
  }

  // Lookahead keys are 32Bit integers in the form
  // TTTTTTTT-ZZZZZZZZZZZZ-YYYY-XXXXXXXX
  // XXXX -> Occurrence Index bitmap.
  // YYYY -> DSL Method Type bitmap.
  // ZZZZZZZZZZZZZZZ -> Rule short Index bitmap.
  // TTTTTTTTT -> alternation alternative index bitmap
  const BITS_FOR_METHOD_TYPE = 4
  const BITS_FOR_OCCURRENCE_IDX = 8
  // short string used as part of mapping keys.
  // being short improves the performance when composing KEYS for maps out of these
  // The 5 - 8 bits (16 possible values, are reserved for the DSL method indices)
  const OR_IDX = 1 << BITS_FOR_OCCURRENCE_IDX
  const OPTION_IDX = 2 << BITS_FOR_OCCURRENCE_IDX
  const MANY_IDX = 3 << BITS_FOR_OCCURRENCE_IDX
  const AT_LEAST_ONE_IDX = 4 << BITS_FOR_OCCURRENCE_IDX
  const MANY_SEP_IDX = 5 << BITS_FOR_OCCURRENCE_IDX
  const AT_LEAST_ONE_SEP_IDX = 6 << BITS_FOR_OCCURRENCE_IDX
  // this actually returns a number, but it is always used as a string (object prop key)
  function getKeyForAutomaticLookahead(ruleIdx, dslMethodIdx, occurrence) {
    return occurrence | dslMethodIdx | ruleIdx
  }

  class LLkLookaheadStrategy {
    constructor(options) {
      var _a
      this.maxLookahead =
        (_a = options === null || options === void 0 ? void 0 : options.maxLookahead) !== null && _a !== void 0
          ? _a
          : DEFAULT_PARSER_CONFIG.maxLookahead
    }
    validate(options) {
      const leftRecursionErrors = this.validateNoLeftRecursion(options.rules)
      if (isEmpty(leftRecursionErrors)) {
        const emptyAltErrors = this.validateEmptyOrAlternatives(options.rules)
        const ambiguousAltsErrors = this.validateAmbiguousAlternationAlternatives(options.rules, this.maxLookahead)
        const emptyRepetitionErrors = this.validateSomeNonEmptyLookaheadPath(options.rules, this.maxLookahead)
        const allErrors = [...leftRecursionErrors, ...emptyAltErrors, ...ambiguousAltsErrors, ...emptyRepetitionErrors]
        return allErrors
      }
      return leftRecursionErrors
    }
    validateNoLeftRecursion(rules) {
      return flatMap(rules, (currTopRule) =>
        validateNoLeftRecursion(currTopRule, currTopRule, defaultGrammarValidatorErrorProvider),
      )
    }
    validateEmptyOrAlternatives(rules) {
      return flatMap(rules, (currTopRule) =>
        validateEmptyOrAlternative(currTopRule, defaultGrammarValidatorErrorProvider),
      )
    }
    validateAmbiguousAlternationAlternatives(rules, maxLookahead) {
      return flatMap(rules, (currTopRule) =>
        validateAmbiguousAlternationAlternatives(currTopRule, maxLookahead, defaultGrammarValidatorErrorProvider),
      )
    }
    validateSomeNonEmptyLookaheadPath(rules, maxLookahead) {
      return validateSomeNonEmptyLookaheadPath(rules, maxLookahead, defaultGrammarValidatorErrorProvider)
    }
    buildLookaheadForAlternation(options) {
      return buildLookaheadFuncForOr(
        options.prodOccurrence,
        options.rule,
        options.maxLookahead,
        options.hasPredicates,
        options.dynamicTokensEnabled,
        buildAlternativesLookAheadFunc,
      )
    }
    buildLookaheadForOptional(options) {
      return buildLookaheadFuncForOptionalProd(
        options.prodOccurrence,
        options.rule,
        options.maxLookahead,
        options.dynamicTokensEnabled,
        getProdType(options.prodType),
        buildSingleAlternativeLookaheadFunction,
      )
    }
  }

  /**
   * Trait responsible for the lookahead related utilities and optimizations.
   */
  class LooksAhead {
    initLooksAhead(config) {
      this.dynamicTokensEnabled = has(config, 'dynamicTokensEnabled')
        ? config.dynamicTokensEnabled // assumes end user provides the correct config value/type
        : DEFAULT_PARSER_CONFIG.dynamicTokensEnabled
      this.maxLookahead = has(config, 'maxLookahead')
        ? config.maxLookahead // assumes end user provides the correct config value/type
        : DEFAULT_PARSER_CONFIG.maxLookahead
      this.lookaheadStrategy = has(config, 'lookaheadStrategy')
        ? config.lookaheadStrategy // assumes end user provides the correct config value/type
        : new LLkLookaheadStrategy({ maxLookahead: this.maxLookahead })
      this.lookAheadFuncsCache = new Map()
    }
    preComputeLookaheadFunctions(rules) {
      forEach(rules, (currRule) => {
        this.TRACE_INIT(`${currRule.name} Rule Lookahead`, () => {
          const {
            alternation,
            repetition,
            option,
            repetitionMandatory,
            repetitionMandatoryWithSeparator,
            repetitionWithSeparator,
          } = collectMethods(currRule)
          forEach(alternation, (currProd) => {
            const prodIdx = currProd.idx === 0 ? '' : currProd.idx
            this.TRACE_INIT(`${getProductionDslName(currProd)}${prodIdx}`, () => {
              const laFunc = this.lookaheadStrategy.buildLookaheadForAlternation({
                prodOccurrence: currProd.idx,
                rule: currRule,
                maxLookahead: currProd.maxLookahead || this.maxLookahead,
                hasPredicates: currProd.hasPredicates,
                dynamicTokensEnabled: this.dynamicTokensEnabled,
              })
              const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[currRule.name], OR_IDX, currProd.idx)
              this.setLaFuncCache(key, laFunc)
            })
          })
          forEach(repetition, (currProd) => {
            this.computeLookaheadFunc(
              currRule,
              currProd.idx,
              MANY_IDX,
              'Repetition',
              currProd.maxLookahead,
              getProductionDslName(currProd),
            )
          })
          forEach(option, (currProd) => {
            this.computeLookaheadFunc(
              currRule,
              currProd.idx,
              OPTION_IDX,
              'Option',
              currProd.maxLookahead,
              getProductionDslName(currProd),
            )
          })
          forEach(repetitionMandatory, (currProd) => {
            this.computeLookaheadFunc(
              currRule,
              currProd.idx,
              AT_LEAST_ONE_IDX,
              'RepetitionMandatory',
              currProd.maxLookahead,
              getProductionDslName(currProd),
            )
          })
          forEach(repetitionMandatoryWithSeparator, (currProd) => {
            this.computeLookaheadFunc(
              currRule,
              currProd.idx,
              AT_LEAST_ONE_SEP_IDX,
              'RepetitionMandatoryWithSeparator',
              currProd.maxLookahead,
              getProductionDslName(currProd),
            )
          })
          forEach(repetitionWithSeparator, (currProd) => {
            this.computeLookaheadFunc(
              currRule,
              currProd.idx,
              MANY_SEP_IDX,
              'RepetitionWithSeparator',
              currProd.maxLookahead,
              getProductionDslName(currProd),
            )
          })
        })
      })
    }
    computeLookaheadFunc(rule, prodOccurrence, prodKey, prodType, prodMaxLookahead, dslMethodName) {
      this.TRACE_INIT(`${dslMethodName}${prodOccurrence === 0 ? '' : prodOccurrence}`, () => {
        const laFunc = this.lookaheadStrategy.buildLookaheadForOptional({
          prodOccurrence,
          rule,
          maxLookahead: prodMaxLookahead || this.maxLookahead,
          dynamicTokensEnabled: this.dynamicTokensEnabled,
          prodType,
        })
        const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[rule.name], prodKey, prodOccurrence)
        this.setLaFuncCache(key, laFunc)
      })
    }
    // this actually returns a number, but it is always used as a string (object prop key)
    getKeyForAutomaticLookahead(dslMethodIdx, occurrence) {
      const currRuleShortName = this.getLastExplicitRuleShortName()
      return getKeyForAutomaticLookahead(currRuleShortName, dslMethodIdx, occurrence)
    }
    getLaFuncFromCache(key) {
      return this.lookAheadFuncsCache.get(key)
    }
    /* istanbul ignore next */
    setLaFuncCache(key, value) {
      this.lookAheadFuncsCache.set(key, value)
    }
  }
  class DslMethodsCollectorVisitor extends GAstVisitor {
    constructor() {
      super(...arguments)
      this.dslMethods = {
        option: [],
        alternation: [],
        repetition: [],
        repetitionWithSeparator: [],
        repetitionMandatory: [],
        repetitionMandatoryWithSeparator: [],
      }
    }
    reset() {
      this.dslMethods = {
        option: [],
        alternation: [],
        repetition: [],
        repetitionWithSeparator: [],
        repetitionMandatory: [],
        repetitionMandatoryWithSeparator: [],
      }
    }
    visitOption(option) {
      this.dslMethods.option.push(option)
    }
    visitRepetitionWithSeparator(manySep) {
      this.dslMethods.repetitionWithSeparator.push(manySep)
    }
    visitRepetitionMandatory(atLeastOne) {
      this.dslMethods.repetitionMandatory.push(atLeastOne)
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.dslMethods.repetitionMandatoryWithSeparator.push(atLeastOneSep)
    }
    visitRepetition(many) {
      this.dslMethods.repetition.push(many)
    }
    visitAlternation(or) {
      this.dslMethods.alternation.push(or)
    }
  }
  const collectorVisitor = new DslMethodsCollectorVisitor()
  function collectMethods(rule) {
    collectorVisitor.reset()
    rule.accept(collectorVisitor)
    const dslMethods = collectorVisitor.dslMethods
    // avoid uncleaned references
    collectorVisitor.reset()
    return dslMethods
  }

  /**
   * This nodeLocation tracking is not efficient and should only be used
   * when error recovery is enabled or the Token Vector contains virtual Tokens
   * (e.g, Python Indent/Outdent)
   * As it executes the calculation for every single terminal/nonTerminal
   * and does not rely on the fact the token vector is **sorted**
   */
  function setNodeLocationOnlyOffset(currNodeLocation, newLocationInfo) {
    // First (valid) update for this cst node
    if (isNaN(currNodeLocation.startOffset) === true) {
      // assumption1: Token location information is either NaN or a valid number
      // assumption2: Token location information is fully valid if it exist
      // (both start/end offsets exist and are numbers).
      currNodeLocation.startOffset = newLocationInfo.startOffset
      currNodeLocation.endOffset = newLocationInfo.endOffset
    }
    // Once the startOffset has been updated with a valid number it should never receive
    // any farther updates as the Token vector is sorted.
    // We still have to check this this condition for every new possible location info
    // because with error recovery enabled we may encounter invalid tokens (NaN location props)
    else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
      currNodeLocation.endOffset = newLocationInfo.endOffset
    }
  }
  /**
   * This nodeLocation tracking is not efficient and should only be used
   * when error recovery is enabled or the Token Vector contains virtual Tokens
   * (e.g, Python Indent/Outdent)
   * As it executes the calculation for every single terminal/nonTerminal
   * and does not rely on the fact the token vector is **sorted**
   */
  function setNodeLocationFull(currNodeLocation, newLocationInfo) {
    // First (valid) update for this cst node
    if (isNaN(currNodeLocation.startOffset) === true) {
      // assumption1: Token location information is either NaN or a valid number
      // assumption2: Token location information is fully valid if it exist
      // (all start/end props exist and are numbers).
      currNodeLocation.startOffset = newLocationInfo.startOffset
      currNodeLocation.startColumn = newLocationInfo.startColumn
      currNodeLocation.startLine = newLocationInfo.startLine
      currNodeLocation.endOffset = newLocationInfo.endOffset
      currNodeLocation.endColumn = newLocationInfo.endColumn
      currNodeLocation.endLine = newLocationInfo.endLine
    }
    // Once the start props has been updated with a valid number it should never receive
    // any farther updates as the Token vector is sorted.
    // We still have to check this this condition for every new possible location info
    // because with error recovery enabled we may encounter invalid tokens (NaN location props)
    else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
      currNodeLocation.endOffset = newLocationInfo.endOffset
      currNodeLocation.endColumn = newLocationInfo.endColumn
      currNodeLocation.endLine = newLocationInfo.endLine
    }
  }
  function addTerminalToCst(node, token, tokenTypeName) {
    if (node.children[tokenTypeName] === undefined) {
      node.children[tokenTypeName] = [token]
    } else {
      node.children[tokenTypeName].push(token)
    }
  }
  function addNoneTerminalToCst(node, ruleName, ruleResult) {
    if (node.children[ruleName] === undefined) {
      node.children[ruleName] = [ruleResult]
    } else {
      node.children[ruleName].push(ruleResult)
    }
  }

  const NAME = 'name'
  function defineNameProp(obj, nameValue) {
    Object.defineProperty(obj, NAME, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: nameValue,
    })
  }

  function defaultVisit(ctx, param) {
    const childrenNames = keys(ctx)
    const childrenNamesLength = childrenNames.length
    for (let i = 0; i < childrenNamesLength; i++) {
      const currChildName = childrenNames[i]
      const currChildArray = ctx[currChildName]
      const currChildArrayLength = currChildArray.length
      for (let j = 0; j < currChildArrayLength; j++) {
        const currChild = currChildArray[j]
        // distinction between Tokens Children and CstNode children
        if (currChild.tokenTypeIdx === undefined) {
          this[currChild.name](currChild.children, param)
        }
      }
    }
    // defaultVisit does not support generic out param
  }
  function createBaseSemanticVisitorConstructor(grammarName, ruleNames) {
    const derivedConstructor = function () {}
    // can be overwritten according to:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/
    // name?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FFunction%2Fname
    defineNameProp(derivedConstructor, grammarName + 'BaseSemantics')
    const semanticProto = {
      visit: function (cstNode, param) {
        // enables writing more concise visitor methods when CstNode has only a single child
        if (isArray$1(cstNode)) {
          // A CST Node's children dictionary can never have empty arrays as values
          // If a key is defined there will be at least one element in the corresponding value array.
          cstNode = cstNode[0]
        }
        // enables passing optional CstNodes concisely.
        if (isUndefined(cstNode)) {
          return undefined
        }
        return this[cstNode.name](cstNode.children, param)
      },
      validateVisitor: function () {
        const semanticDefinitionErrors = validateVisitor(this, ruleNames)
        if (!isEmpty(semanticDefinitionErrors)) {
          const errorMessages = map(semanticDefinitionErrors, (currDefError) => currDefError.msg)
          throw Error(
            `Errors Detected in CST Visitor <${this.constructor.name}>:\n\t` +
              `${errorMessages.join('\n\n').replace(/\n/g, '\n\t')}`,
          )
        }
      },
    }
    derivedConstructor.prototype = semanticProto
    derivedConstructor.prototype.constructor = derivedConstructor
    derivedConstructor._RULE_NAMES = ruleNames
    return derivedConstructor
  }
  function createBaseVisitorConstructorWithDefaults(grammarName, ruleNames, baseConstructor) {
    const derivedConstructor = function () {}
    // can be overwritten according to:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/
    // name?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FFunction%2Fname
    defineNameProp(derivedConstructor, grammarName + 'BaseSemanticsWithDefaults')
    const withDefaultsProto = Object.create(baseConstructor.prototype)
    forEach(ruleNames, (ruleName) => {
      withDefaultsProto[ruleName] = defaultVisit
    })
    derivedConstructor.prototype = withDefaultsProto
    derivedConstructor.prototype.constructor = derivedConstructor
    return derivedConstructor
  }
  var CstVisitorDefinitionError
  ;(function (CstVisitorDefinitionError) {
    CstVisitorDefinitionError[(CstVisitorDefinitionError['REDUNDANT_METHOD'] = 0)] = 'REDUNDANT_METHOD'
    CstVisitorDefinitionError[(CstVisitorDefinitionError['MISSING_METHOD'] = 1)] = 'MISSING_METHOD'
  })(CstVisitorDefinitionError || (CstVisitorDefinitionError = {}))
  function validateVisitor(visitorInstance, ruleNames) {
    const missingErrors = validateMissingCstMethods(visitorInstance, ruleNames)
    return missingErrors
  }
  function validateMissingCstMethods(visitorInstance, ruleNames) {
    const missingRuleNames = filter(ruleNames, (currRuleName) => {
      return isFunction(visitorInstance[currRuleName]) === false
    })
    const errors = map(missingRuleNames, (currRuleName) => {
      return {
        msg: `Missing visitor method: <${currRuleName}> on ${visitorInstance.constructor.name} CST Visitor.`,
        type: CstVisitorDefinitionError.MISSING_METHOD,
        methodName: currRuleName,
      }
    })
    return compact(errors)
  }

  /**
   * This trait is responsible for the CST building logic.
   */
  class TreeBuilder {
    initTreeBuilder(config) {
      this.CST_STACK = []
      // outputCst is no longer exposed/defined in the pubic API
      this.outputCst = config.outputCst
      this.nodeLocationTracking = has(config, 'nodeLocationTracking')
        ? config.nodeLocationTracking // assumes end user provides the correct config value/type
        : DEFAULT_PARSER_CONFIG.nodeLocationTracking
      if (!this.outputCst) {
        this.cstInvocationStateUpdate = noop
        this.cstFinallyStateUpdate = noop
        this.cstPostTerminal = noop
        this.cstPostNonTerminal = noop
        this.cstPostRule = noop
      } else {
        if (/full/i.test(this.nodeLocationTracking)) {
          if (this.recoveryEnabled) {
            this.setNodeLocationFromToken = setNodeLocationFull
            this.setNodeLocationFromNode = setNodeLocationFull
            this.cstPostRule = noop
            this.setInitialNodeLocation = this.setInitialNodeLocationFullRecovery
          } else {
            this.setNodeLocationFromToken = noop
            this.setNodeLocationFromNode = noop
            this.cstPostRule = this.cstPostRuleFull
            this.setInitialNodeLocation = this.setInitialNodeLocationFullRegular
          }
        } else if (/onlyOffset/i.test(this.nodeLocationTracking)) {
          if (this.recoveryEnabled) {
            this.setNodeLocationFromToken = setNodeLocationOnlyOffset
            this.setNodeLocationFromNode = setNodeLocationOnlyOffset
            this.cstPostRule = noop
            this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRecovery
          } else {
            this.setNodeLocationFromToken = noop
            this.setNodeLocationFromNode = noop
            this.cstPostRule = this.cstPostRuleOnlyOffset
            this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRegular
          }
        } else if (/none/i.test(this.nodeLocationTracking)) {
          this.setNodeLocationFromToken = noop
          this.setNodeLocationFromNode = noop
          this.cstPostRule = noop
          this.setInitialNodeLocation = noop
        } else {
          throw Error(`Invalid <nodeLocationTracking> config option: "${config.nodeLocationTracking}"`)
        }
      }
    }
    setInitialNodeLocationOnlyOffsetRecovery(cstNode) {
      cstNode.location = {
        startOffset: NaN,
        endOffset: NaN,
      }
    }
    setInitialNodeLocationOnlyOffsetRegular(cstNode) {
      cstNode.location = {
        // without error recovery the starting Location of a new CstNode is guaranteed
        // To be the next Token's startOffset (for valid inputs).
        // For invalid inputs there won't be any CSTOutput so this potential
        // inaccuracy does not matter
        startOffset: this.LA(1).startOffset,
        endOffset: NaN,
      }
    }
    setInitialNodeLocationFullRecovery(cstNode) {
      cstNode.location = {
        startOffset: NaN,
        startLine: NaN,
        startColumn: NaN,
        endOffset: NaN,
        endLine: NaN,
        endColumn: NaN,
      }
    }
    /**
       *  @see setInitialNodeLocationOnlyOffsetRegular for explanation why this work
  
       * @param cstNode
       */
    setInitialNodeLocationFullRegular(cstNode) {
      const nextToken = this.LA(1)
      cstNode.location = {
        startOffset: nextToken.startOffset,
        startLine: nextToken.startLine,
        startColumn: nextToken.startColumn,
        endOffset: NaN,
        endLine: NaN,
        endColumn: NaN,
      }
    }
    cstInvocationStateUpdate(fullRuleName) {
      const cstNode = {
        name: fullRuleName,
        children: Object.create(null),
      }
      this.setInitialNodeLocation(cstNode)
      this.CST_STACK.push(cstNode)
    }
    cstFinallyStateUpdate() {
      this.CST_STACK.pop()
    }
    cstPostRuleFull(ruleCstNode) {
      // casts to `required<CstNodeLocation>` are safe because `cstPostRuleFull` should only be invoked when full location is enabled
      const prevToken = this.LA(0)
      const loc = ruleCstNode.location
      // If this condition is true it means we consumed at least one Token
      // In this CstNode.
      if (loc.startOffset <= prevToken.startOffset === true) {
        loc.endOffset = prevToken.endOffset
        loc.endLine = prevToken.endLine
        loc.endColumn = prevToken.endColumn
      }
      // "empty" CstNode edge case
      else {
        loc.startOffset = NaN
        loc.startLine = NaN
        loc.startColumn = NaN
      }
    }
    cstPostRuleOnlyOffset(ruleCstNode) {
      const prevToken = this.LA(0)
      // `location' is not null because `cstPostRuleOnlyOffset` will only be invoked when location tracking is enabled.
      const loc = ruleCstNode.location
      // If this condition is true it means we consumed at least one Token
      // In this CstNode.
      if (loc.startOffset <= prevToken.startOffset === true) {
        loc.endOffset = prevToken.endOffset
      }
      // "empty" CstNode edge case
      else {
        loc.startOffset = NaN
      }
    }
    cstPostTerminal(key, consumedToken) {
      const rootCst = this.CST_STACK[this.CST_STACK.length - 1]
      addTerminalToCst(rootCst, consumedToken, key)
      // This is only used when **both** error recovery and CST Output are enabled.
      this.setNodeLocationFromToken(rootCst.location, consumedToken)
    }
    cstPostNonTerminal(ruleCstResult, ruleName) {
      const preCstNode = this.CST_STACK[this.CST_STACK.length - 1]
      addNoneTerminalToCst(preCstNode, ruleName, ruleCstResult)
      // This is only used when **both** error recovery and CST Output are enabled.
      this.setNodeLocationFromNode(preCstNode.location, ruleCstResult.location)
    }
    getBaseCstVisitorConstructor() {
      if (isUndefined(this.baseCstVisitorConstructor)) {
        const newBaseCstVisitorConstructor = createBaseSemanticVisitorConstructor(
          this.className,
          keys(this.gastProductionsCache),
        )
        this.baseCstVisitorConstructor = newBaseCstVisitorConstructor
        return newBaseCstVisitorConstructor
      }
      return this.baseCstVisitorConstructor
    }
    getBaseCstVisitorConstructorWithDefaults() {
      if (isUndefined(this.baseCstVisitorWithDefaultsConstructor)) {
        const newConstructor = createBaseVisitorConstructorWithDefaults(
          this.className,
          keys(this.gastProductionsCache),
          this.getBaseCstVisitorConstructor(),
        )
        this.baseCstVisitorWithDefaultsConstructor = newConstructor
        return newConstructor
      }
      return this.baseCstVisitorWithDefaultsConstructor
    }
    getLastExplicitRuleShortName() {
      const ruleStack = this.RULE_STACK
      return ruleStack[ruleStack.length - 1]
    }
    getPreviousExplicitRuleShortName() {
      const ruleStack = this.RULE_STACK
      return ruleStack[ruleStack.length - 2]
    }
    getLastExplicitRuleOccurrenceIndex() {
      const occurrenceStack = this.RULE_OCCURRENCE_STACK
      return occurrenceStack[occurrenceStack.length - 1]
    }
  }

  /**
   * Trait responsible abstracting over the interaction with Lexer output (Token vector).
   *
   * This could be generalized to support other kinds of lexers, e.g.
   * - Just in Time Lexing / Lexer-Less parsing.
   * - Streaming Lexer.
   */
  class LexerAdapter {
    initLexerAdapter() {
      this.tokVector = []
      this.tokVectorLength = 0
      this.currIdx = -1
    }
    set input(newInput) {
      // @ts-ignore - `this parameter` not supported in setters/getters
      //   - https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
      if (this.selfAnalysisDone !== true) {
        throw Error(`Missing <performSelfAnalysis> invocation at the end of the Parser's constructor.`)
      }
      // @ts-ignore - `this parameter` not supported in setters/getters
      //   - https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
      this.reset()
      this.tokVector = newInput
      this.tokVectorLength = newInput.length
    }
    get input() {
      return this.tokVector
    }
    // skips a token and returns the next token
    SKIP_TOKEN() {
      if (this.currIdx <= this.tokVector.length - 2) {
        this.consumeToken()
        return this.LA(1)
      } else {
        return END_OF_FILE
      }
    }
    // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
    // or lexers dependent on parser context.
    LA(howMuch) {
      const soughtIdx = this.currIdx + howMuch
      if (soughtIdx < 0 || this.tokVectorLength <= soughtIdx) {
        return END_OF_FILE
      } else {
        return this.tokVector[soughtIdx]
      }
    }
    consumeToken() {
      this.currIdx++
    }
    exportLexerState() {
      return this.currIdx
    }
    importLexerState(newState) {
      this.currIdx = newState
    }
    resetLexerState() {
      this.currIdx = -1
    }
    moveToTerminatedState() {
      this.currIdx = this.tokVector.length - 1
    }
    getLexerPosition() {
      return this.exportLexerState()
    }
  }

  /**
   * This trait is responsible for implementing the public API
   * for defining Chevrotain parsers, i.e:
   * - CONSUME
   * - RULE
   * - OPTION
   * - ...
   */
  class RecognizerApi {
    ACTION(impl) {
      return impl.call(this)
    }
    consume(idx, tokType, options) {
      return this.consumeInternal(tokType, idx, options)
    }
    subrule(idx, ruleToCall, options) {
      return this.subruleInternal(ruleToCall, idx, options)
    }
    option(idx, actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, idx)
    }
    or(idx, altsOrOpts) {
      return this.orInternal(altsOrOpts, idx)
    }
    many(idx, actionORMethodDef) {
      return this.manyInternal(idx, actionORMethodDef)
    }
    atLeastOne(idx, actionORMethodDef) {
      return this.atLeastOneInternal(idx, actionORMethodDef)
    }
    CONSUME(tokType, options) {
      return this.consumeInternal(tokType, 0, options)
    }
    CONSUME1(tokType, options) {
      return this.consumeInternal(tokType, 1, options)
    }
    CONSUME2(tokType, options) {
      return this.consumeInternal(tokType, 2, options)
    }
    CONSUME3(tokType, options) {
      return this.consumeInternal(tokType, 3, options)
    }
    CONSUME4(tokType, options) {
      return this.consumeInternal(tokType, 4, options)
    }
    CONSUME5(tokType, options) {
      return this.consumeInternal(tokType, 5, options)
    }
    CONSUME6(tokType, options) {
      return this.consumeInternal(tokType, 6, options)
    }
    CONSUME7(tokType, options) {
      return this.consumeInternal(tokType, 7, options)
    }
    CONSUME8(tokType, options) {
      return this.consumeInternal(tokType, 8, options)
    }
    CONSUME9(tokType, options) {
      return this.consumeInternal(tokType, 9, options)
    }
    SUBRULE(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 0, options)
    }
    SUBRULE1(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 1, options)
    }
    SUBRULE2(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 2, options)
    }
    SUBRULE3(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 3, options)
    }
    SUBRULE4(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 4, options)
    }
    SUBRULE5(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 5, options)
    }
    SUBRULE6(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 6, options)
    }
    SUBRULE7(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 7, options)
    }
    SUBRULE8(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 8, options)
    }
    SUBRULE9(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 9, options)
    }
    OPTION(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 0)
    }
    OPTION1(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 1)
    }
    OPTION2(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 2)
    }
    OPTION3(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 3)
    }
    OPTION4(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 4)
    }
    OPTION5(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 5)
    }
    OPTION6(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 6)
    }
    OPTION7(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 7)
    }
    OPTION8(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 8)
    }
    OPTION9(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 9)
    }
    OR(altsOrOpts) {
      return this.orInternal(altsOrOpts, 0)
    }
    OR1(altsOrOpts) {
      return this.orInternal(altsOrOpts, 1)
    }
    OR2(altsOrOpts) {
      return this.orInternal(altsOrOpts, 2)
    }
    OR3(altsOrOpts) {
      return this.orInternal(altsOrOpts, 3)
    }
    OR4(altsOrOpts) {
      return this.orInternal(altsOrOpts, 4)
    }
    OR5(altsOrOpts) {
      return this.orInternal(altsOrOpts, 5)
    }
    OR6(altsOrOpts) {
      return this.orInternal(altsOrOpts, 6)
    }
    OR7(altsOrOpts) {
      return this.orInternal(altsOrOpts, 7)
    }
    OR8(altsOrOpts) {
      return this.orInternal(altsOrOpts, 8)
    }
    OR9(altsOrOpts) {
      return this.orInternal(altsOrOpts, 9)
    }
    MANY(actionORMethodDef) {
      this.manyInternal(0, actionORMethodDef)
    }
    MANY1(actionORMethodDef) {
      this.manyInternal(1, actionORMethodDef)
    }
    MANY2(actionORMethodDef) {
      this.manyInternal(2, actionORMethodDef)
    }
    MANY3(actionORMethodDef) {
      this.manyInternal(3, actionORMethodDef)
    }
    MANY4(actionORMethodDef) {
      this.manyInternal(4, actionORMethodDef)
    }
    MANY5(actionORMethodDef) {
      this.manyInternal(5, actionORMethodDef)
    }
    MANY6(actionORMethodDef) {
      this.manyInternal(6, actionORMethodDef)
    }
    MANY7(actionORMethodDef) {
      this.manyInternal(7, actionORMethodDef)
    }
    MANY8(actionORMethodDef) {
      this.manyInternal(8, actionORMethodDef)
    }
    MANY9(actionORMethodDef) {
      this.manyInternal(9, actionORMethodDef)
    }
    MANY_SEP(options) {
      this.manySepFirstInternal(0, options)
    }
    MANY_SEP1(options) {
      this.manySepFirstInternal(1, options)
    }
    MANY_SEP2(options) {
      this.manySepFirstInternal(2, options)
    }
    MANY_SEP3(options) {
      this.manySepFirstInternal(3, options)
    }
    MANY_SEP4(options) {
      this.manySepFirstInternal(4, options)
    }
    MANY_SEP5(options) {
      this.manySepFirstInternal(5, options)
    }
    MANY_SEP6(options) {
      this.manySepFirstInternal(6, options)
    }
    MANY_SEP7(options) {
      this.manySepFirstInternal(7, options)
    }
    MANY_SEP8(options) {
      this.manySepFirstInternal(8, options)
    }
    MANY_SEP9(options) {
      this.manySepFirstInternal(9, options)
    }
    AT_LEAST_ONE(actionORMethodDef) {
      this.atLeastOneInternal(0, actionORMethodDef)
    }
    AT_LEAST_ONE1(actionORMethodDef) {
      return this.atLeastOneInternal(1, actionORMethodDef)
    }
    AT_LEAST_ONE2(actionORMethodDef) {
      this.atLeastOneInternal(2, actionORMethodDef)
    }
    AT_LEAST_ONE3(actionORMethodDef) {
      this.atLeastOneInternal(3, actionORMethodDef)
    }
    AT_LEAST_ONE4(actionORMethodDef) {
      this.atLeastOneInternal(4, actionORMethodDef)
    }
    AT_LEAST_ONE5(actionORMethodDef) {
      this.atLeastOneInternal(5, actionORMethodDef)
    }
    AT_LEAST_ONE6(actionORMethodDef) {
      this.atLeastOneInternal(6, actionORMethodDef)
    }
    AT_LEAST_ONE7(actionORMethodDef) {
      this.atLeastOneInternal(7, actionORMethodDef)
    }
    AT_LEAST_ONE8(actionORMethodDef) {
      this.atLeastOneInternal(8, actionORMethodDef)
    }
    AT_LEAST_ONE9(actionORMethodDef) {
      this.atLeastOneInternal(9, actionORMethodDef)
    }
    AT_LEAST_ONE_SEP(options) {
      this.atLeastOneSepFirstInternal(0, options)
    }
    AT_LEAST_ONE_SEP1(options) {
      this.atLeastOneSepFirstInternal(1, options)
    }
    AT_LEAST_ONE_SEP2(options) {
      this.atLeastOneSepFirstInternal(2, options)
    }
    AT_LEAST_ONE_SEP3(options) {
      this.atLeastOneSepFirstInternal(3, options)
    }
    AT_LEAST_ONE_SEP4(options) {
      this.atLeastOneSepFirstInternal(4, options)
    }
    AT_LEAST_ONE_SEP5(options) {
      this.atLeastOneSepFirstInternal(5, options)
    }
    AT_LEAST_ONE_SEP6(options) {
      this.atLeastOneSepFirstInternal(6, options)
    }
    AT_LEAST_ONE_SEP7(options) {
      this.atLeastOneSepFirstInternal(7, options)
    }
    AT_LEAST_ONE_SEP8(options) {
      this.atLeastOneSepFirstInternal(8, options)
    }
    AT_LEAST_ONE_SEP9(options) {
      this.atLeastOneSepFirstInternal(9, options)
    }
    RULE(name, implementation, config = DEFAULT_RULE_CONFIG) {
      if (includes(this.definedRulesNames, name)) {
        const errMsg = defaultGrammarValidatorErrorProvider.buildDuplicateRuleNameError({
          topLevelRule: name,
          grammarName: this.className,
        })
        const error = {
          message: errMsg,
          type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
          ruleName: name,
        }
        this.definitionErrors.push(error)
      }
      this.definedRulesNames.push(name)
      const ruleImplementation = this.defineRule(name, implementation, config)
      this[name] = ruleImplementation
      return ruleImplementation
    }
    OVERRIDE_RULE(name, impl, config = DEFAULT_RULE_CONFIG) {
      const ruleErrors = validateRuleIsOverridden(name, this.definedRulesNames, this.className)
      this.definitionErrors = this.definitionErrors.concat(ruleErrors)
      const ruleImplementation = this.defineRule(name, impl, config)
      this[name] = ruleImplementation
      return ruleImplementation
    }
    BACKTRACK(grammarRule, args) {
      return function () {
        // save org state
        this.isBackTrackingStack.push(1)
        const orgState = this.saveRecogState()
        try {
          grammarRule.apply(this, args)
          // if no exception was thrown we have succeed parsing the rule.
          return true
        } catch (e) {
          if (isRecognitionException(e)) {
            return false
          } else {
            throw e
          }
        } finally {
          this.reloadRecogState(orgState)
          this.isBackTrackingStack.pop()
        }
      }
    }
    // GAST export APIs
    getGAstProductions() {
      return this.gastProductionsCache
    }
    getSerializedGastProductions() {
      return serializeGrammar(values(this.gastProductionsCache))
    }
  }

  /**
   * This trait is responsible for the runtime parsing engine
   * Used by the official API (recognizer_api.ts)
   */
  class RecognizerEngine {
    initRecognizerEngine(tokenVocabulary, config) {
      this.className = this.constructor.name
      // TODO: would using an ES6 Map or plain object be faster (CST building scenario)
      this.shortRuleNameToFull = {}
      this.fullRuleNameToShort = {}
      this.ruleShortNameIdx = 256
      this.tokenMatcher = tokenStructuredMatcherNoCategories
      this.subruleIdx = 0
      this.definedRulesNames = []
      this.tokensMap = {}
      this.isBackTrackingStack = []
      this.RULE_STACK = []
      this.RULE_OCCURRENCE_STACK = []
      this.gastProductionsCache = {}
      if (has(config, 'serializedGrammar')) {
        throw Error(
          "The Parser's configuration can no longer contain a <serializedGrammar> property.\n" +
            '\tSee: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_6-0-0\n' +
            '\tFor Further details.',
        )
      }
      if (isArray$1(tokenVocabulary)) {
        // This only checks for Token vocabularies provided as arrays.
        // That is good enough because the main objective is to detect users of pre-V4.0 APIs
        // rather than all edge cases of empty Token vocabularies.
        if (isEmpty(tokenVocabulary)) {
          throw Error(
            'A Token Vocabulary cannot be empty.\n' +
              '\tNote that the first argument for the parser constructor\n' +
              '\tis no longer a Token vector (since v4.0).',
          )
        }
        if (typeof tokenVocabulary[0].startOffset === 'number') {
          throw Error(
            'The Parser constructor no longer accepts a token vector as the first argument.\n' +
              '\tSee: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_4-0-0\n' +
              '\tFor Further details.',
          )
        }
      }
      if (isArray$1(tokenVocabulary)) {
        this.tokensMap = reduce(
          tokenVocabulary,
          (acc, tokType) => {
            acc[tokType.name] = tokType
            return acc
          },
          {},
        )
      } else if (has(tokenVocabulary, 'modes') && every(flatten(values(tokenVocabulary.modes)), isTokenType)) {
        const allTokenTypes = flatten(values(tokenVocabulary.modes))
        const uniqueTokens = uniq(allTokenTypes)
        this.tokensMap = reduce(
          uniqueTokens,
          (acc, tokType) => {
            acc[tokType.name] = tokType
            return acc
          },
          {},
        )
      } else if (isObject(tokenVocabulary)) {
        this.tokensMap = clone(tokenVocabulary)
      } else {
        throw new Error(
          '<tokensDictionary> argument must be An Array of Token constructors,' +
            ' A dictionary of Token constructors or an IMultiModeLexerDefinition',
        )
      }
      // always add EOF to the tokenNames -> constructors map. it is useful to assure all the input has been
      // parsed with a clear error message ("expecting EOF but found ...")
      this.tokensMap['EOF'] = EOF
      const allTokenTypes = has(tokenVocabulary, 'modes')
        ? flatten(values(tokenVocabulary.modes))
        : values(tokenVocabulary)
      const noTokenCategoriesUsed = every(allTokenTypes, (tokenConstructor) =>
        isEmpty(tokenConstructor.categoryMatches),
      )
      this.tokenMatcher = noTokenCategoriesUsed ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher
      // Because ES2015+ syntax should be supported for creating Token classes
      // We cannot assume that the Token classes were created using the "extendToken" utilities
      // Therefore we must augment the Token classes both on Lexer initialization and on Parser initialization
      augmentTokenTypes(values(this.tokensMap))
    }
    defineRule(ruleName, impl, config) {
      if (this.selfAnalysisDone) {
        throw Error(
          `Grammar rule <${ruleName}> may not be defined after the 'performSelfAnalysis' method has been called'\n` +
            `Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.`,
        )
      }
      const resyncEnabled = has(config, 'resyncEnabled')
        ? config.resyncEnabled // assumes end user provides the correct config value/type
        : DEFAULT_RULE_CONFIG.resyncEnabled
      const recoveryValueFunc = has(config, 'recoveryValueFunc')
        ? config.recoveryValueFunc // assumes end user provides the correct config value/type
        : DEFAULT_RULE_CONFIG.recoveryValueFunc
      // performance optimization: Use small integers as keys for the longer human readable "full" rule names.
      // this greatly improves Map access time (as much as 8% for some performance benchmarks).
      const shortName = this.ruleShortNameIdx << (BITS_FOR_METHOD_TYPE + BITS_FOR_OCCURRENCE_IDX)
      this.ruleShortNameIdx++
      this.shortRuleNameToFull[shortName] = ruleName
      this.fullRuleNameToShort[ruleName] = shortName
      let invokeRuleWithTry
      // Micro optimization, only check the condition **once** on rule definition
      // instead of **every single** rule invocation.
      if (this.outputCst === true) {
        invokeRuleWithTry = function invokeRuleWithTry(...args) {
          try {
            this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx)
            impl.apply(this, args)
            const cst = this.CST_STACK[this.CST_STACK.length - 1]
            this.cstPostRule(cst)
            return cst
          } catch (e) {
            return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc)
          } finally {
            this.ruleFinallyStateUpdate()
          }
        }
      } else {
        invokeRuleWithTry = function invokeRuleWithTryCst(...args) {
          try {
            this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx)
            return impl.apply(this, args)
          } catch (e) {
            return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc)
          } finally {
            this.ruleFinallyStateUpdate()
          }
        }
      }
      const wrappedGrammarRule = Object.assign(invokeRuleWithTry, { ruleName, originalGrammarAction: impl })
      return wrappedGrammarRule
    }
    invokeRuleCatch(e, resyncEnabledConfig, recoveryValueFunc) {
      const isFirstInvokedRule = this.RULE_STACK.length === 1
      // note the reSync is always enabled for the first rule invocation, because we must always be able to
      // reSync with EOF and just output some INVALID ParseTree
      // during backtracking reSync recovery is disabled, otherwise we can't be certain the backtracking
      // path is really the most valid one
      const reSyncEnabled = resyncEnabledConfig && !this.isBackTracking() && this.recoveryEnabled
      if (isRecognitionException(e)) {
        const recogError = e
        if (reSyncEnabled) {
          const reSyncTokType = this.findReSyncTokenType()
          if (this.isInCurrentRuleReSyncSet(reSyncTokType)) {
            recogError.resyncedTokens = this.reSyncTo(reSyncTokType)
            if (this.outputCst) {
              const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1]
              partialCstResult.recoveredNode = true
              return partialCstResult
            } else {
              return recoveryValueFunc(e)
            }
          } else {
            if (this.outputCst) {
              const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1]
              partialCstResult.recoveredNode = true
              recogError.partialCstResult = partialCstResult
            }
            // to be handled Further up the call stack
            throw recogError
          }
        } else if (isFirstInvokedRule) {
          // otherwise a Redundant input error will be created as well and we cannot guarantee that this is indeed the case
          this.moveToTerminatedState()
          // the parser should never throw one of its own errors outside its flow.
          // even if error recovery is disabled
          return recoveryValueFunc(e)
        } else {
          // to be recovered Further up the call stack
          throw recogError
        }
      } else {
        // some other Error type which we don't know how to handle (for example a built in JavaScript Error)
        throw e
      }
    }
    // Implementation of parsing DSL
    optionInternal(actionORMethodDef, occurrence) {
      const key = this.getKeyForAutomaticLookahead(OPTION_IDX, occurrence)
      return this.optionInternalLogic(actionORMethodDef, occurrence, key)
    }
    optionInternalLogic(actionORMethodDef, occurrence, key) {
      let lookAheadFunc = this.getLaFuncFromCache(key)
      let action
      if (typeof actionORMethodDef !== 'function') {
        action = actionORMethodDef.DEF
        const predicate = actionORMethodDef.GATE
        // predicate present
        if (predicate !== undefined) {
          const orgLookaheadFunction = lookAheadFunc
          lookAheadFunc = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this)
          }
        }
      } else {
        action = actionORMethodDef
      }
      if (lookAheadFunc.call(this) === true) {
        return action.call(this)
      }
      return undefined
    }
    atLeastOneInternal(prodOccurrence, actionORMethodDef) {
      const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_IDX, prodOccurrence)
      return this.atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, laKey)
    }
    atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, key) {
      let lookAheadFunc = this.getLaFuncFromCache(key)
      let action
      if (typeof actionORMethodDef !== 'function') {
        action = actionORMethodDef.DEF
        const predicate = actionORMethodDef.GATE
        // predicate present
        if (predicate !== undefined) {
          const orgLookaheadFunction = lookAheadFunc
          lookAheadFunc = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this)
          }
        }
      } else {
        action = actionORMethodDef
      }
      if (lookAheadFunc.call(this) === true) {
        let notStuck = this.doSingleRepetition(action)
        while (lookAheadFunc.call(this) === true && notStuck === true) {
          notStuck = this.doSingleRepetition(action)
        }
      } else {
        throw this.raiseEarlyExitException(prodOccurrence, PROD_TYPE.REPETITION_MANDATORY, actionORMethodDef.ERR_MSG)
      }
      // note that while it may seem that this can cause an error because by using a recursive call to
      // AT_LEAST_ONE we change the grammar to AT_LEAST_TWO, AT_LEAST_THREE ... , the possible recursive call
      // from the tryInRepetitionRecovery(...) will only happen IFF there really are TWO/THREE/.... items.
      // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
      this.attemptInRepetitionRecovery(
        this.atLeastOneInternal,
        [prodOccurrence, actionORMethodDef],
        lookAheadFunc,
        AT_LEAST_ONE_IDX,
        prodOccurrence,
        NextTerminalAfterAtLeastOneWalker,
      )
    }
    atLeastOneSepFirstInternal(prodOccurrence, options) {
      const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_SEP_IDX, prodOccurrence)
      this.atLeastOneSepFirstInternalLogic(prodOccurrence, options, laKey)
    }
    atLeastOneSepFirstInternalLogic(prodOccurrence, options, key) {
      const action = options.DEF
      const separator = options.SEP
      const firstIterationLookaheadFunc = this.getLaFuncFromCache(key)
      // 1st iteration
      if (firstIterationLookaheadFunc.call(this) === true) {
        action.call(this)
        //  TODO: Optimization can move this function construction into "attemptInRepetitionRecovery"
        //  because it is only needed in error recovery scenarios.
        const separatorLookAheadFunc = () => {
          return this.tokenMatcher(this.LA(1), separator)
        }
        // 2nd..nth iterations
        while (this.tokenMatcher(this.LA(1), separator) === true) {
          // note that this CONSUME will never enter recovery because
          // the separatorLookAheadFunc checks that the separator really does exist.
          this.CONSUME(separator)
          // No need for checking infinite loop here due to consuming the separator.
          action.call(this)
        }
        // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
        this.attemptInRepetitionRecovery(
          this.repetitionSepSecondInternal,
          [prodOccurrence, separator, separatorLookAheadFunc, action, NextTerminalAfterAtLeastOneSepWalker],
          separatorLookAheadFunc,
          AT_LEAST_ONE_SEP_IDX,
          prodOccurrence,
          NextTerminalAfterAtLeastOneSepWalker,
        )
      } else {
        throw this.raiseEarlyExitException(
          prodOccurrence,
          PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR,
          options.ERR_MSG,
        )
      }
    }
    manyInternal(prodOccurrence, actionORMethodDef) {
      const laKey = this.getKeyForAutomaticLookahead(MANY_IDX, prodOccurrence)
      return this.manyInternalLogic(prodOccurrence, actionORMethodDef, laKey)
    }
    manyInternalLogic(prodOccurrence, actionORMethodDef, key) {
      let lookaheadFunction = this.getLaFuncFromCache(key)
      let action
      if (typeof actionORMethodDef !== 'function') {
        action = actionORMethodDef.DEF
        const predicate = actionORMethodDef.GATE
        // predicate present
        if (predicate !== undefined) {
          const orgLookaheadFunction = lookaheadFunction
          lookaheadFunction = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this)
          }
        }
      } else {
        action = actionORMethodDef
      }
      let notStuck = true
      while (lookaheadFunction.call(this) === true && notStuck === true) {
        notStuck = this.doSingleRepetition(action)
      }
      // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
      this.attemptInRepetitionRecovery(
        this.manyInternal,
        [prodOccurrence, actionORMethodDef],
        lookaheadFunction,
        MANY_IDX,
        prodOccurrence,
        NextTerminalAfterManyWalker,
        // The notStuck parameter is only relevant when "attemptInRepetitionRecovery"
        // is invoked from manyInternal, in the MANY_SEP case and AT_LEAST_ONE[_SEP]
        // An infinite loop cannot occur as:
        // - Either the lookahead is guaranteed to consume something (Single Token Separator)
        // - AT_LEAST_ONE by definition is guaranteed to consume something (or error out).
        notStuck,
      )
    }
    manySepFirstInternal(prodOccurrence, options) {
      const laKey = this.getKeyForAutomaticLookahead(MANY_SEP_IDX, prodOccurrence)
      this.manySepFirstInternalLogic(prodOccurrence, options, laKey)
    }
    manySepFirstInternalLogic(prodOccurrence, options, key) {
      const action = options.DEF
      const separator = options.SEP
      const firstIterationLaFunc = this.getLaFuncFromCache(key)
      // 1st iteration
      if (firstIterationLaFunc.call(this) === true) {
        action.call(this)
        const separatorLookAheadFunc = () => {
          return this.tokenMatcher(this.LA(1), separator)
        }
        // 2nd..nth iterations
        while (this.tokenMatcher(this.LA(1), separator) === true) {
          // note that this CONSUME will never enter recovery because
          // the separatorLookAheadFunc checks that the separator really does exist.
          this.CONSUME(separator)
          // No need for checking infinite loop here due to consuming the separator.
          action.call(this)
        }
        // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
        this.attemptInRepetitionRecovery(
          this.repetitionSepSecondInternal,
          [prodOccurrence, separator, separatorLookAheadFunc, action, NextTerminalAfterManySepWalker],
          separatorLookAheadFunc,
          MANY_SEP_IDX,
          prodOccurrence,
          NextTerminalAfterManySepWalker,
        )
      }
    }
    repetitionSepSecondInternal(prodOccurrence, separator, separatorLookAheadFunc, action, nextTerminalAfterWalker) {
      while (separatorLookAheadFunc()) {
        // note that this CONSUME will never enter recovery because
        // the separatorLookAheadFunc checks that the separator really does exist.
        this.CONSUME(separator)
        action.call(this)
      }
      // we can only arrive to this function after an error
      // has occurred (hence the name 'second') so the following
      // IF will always be entered, its possible to remove it...
      // however it is kept to avoid confusion and be consistent.
      // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
      /* istanbul ignore else */
      this.attemptInRepetitionRecovery(
        this.repetitionSepSecondInternal,
        [prodOccurrence, separator, separatorLookAheadFunc, action, nextTerminalAfterWalker],
        separatorLookAheadFunc,
        AT_LEAST_ONE_SEP_IDX,
        prodOccurrence,
        nextTerminalAfterWalker,
      )
    }
    doSingleRepetition(action) {
      const beforeIteration = this.getLexerPosition()
      action.call(this)
      const afterIteration = this.getLexerPosition()
      // This boolean will indicate if this repetition progressed
      // or if we are "stuck" (potential infinite loop in the repetition).
      return afterIteration > beforeIteration
    }
    orInternal(altsOrOpts, occurrence) {
      const laKey = this.getKeyForAutomaticLookahead(OR_IDX, occurrence)
      const alts = isArray$1(altsOrOpts) ? altsOrOpts : altsOrOpts.DEF
      const laFunc = this.getLaFuncFromCache(laKey)
      const altIdxToTake = laFunc.call(this, alts)
      if (altIdxToTake !== undefined) {
        const chosenAlternative = alts[altIdxToTake]
        return chosenAlternative.ALT.call(this)
      }
      this.raiseNoAltException(occurrence, altsOrOpts.ERR_MSG)
    }
    ruleFinallyStateUpdate() {
      this.RULE_STACK.pop()
      this.RULE_OCCURRENCE_STACK.pop()
      // NOOP when cst is disabled
      this.cstFinallyStateUpdate()
      if (this.RULE_STACK.length === 0 && this.isAtEndOfInput() === false) {
        const firstRedundantTok = this.LA(1)
        const errMsg = this.errorMessageProvider.buildNotAllInputParsedMessage({
          firstRedundant: firstRedundantTok,
          ruleName: this.getCurrRuleFullName(),
        })
        this.SAVE_ERROR(new NotAllInputParsedException(errMsg, firstRedundantTok))
      }
    }
    subruleInternal(ruleToCall, idx, options) {
      let ruleResult
      try {
        const args = options !== undefined ? options.ARGS : undefined
        this.subruleIdx = idx
        ruleResult = ruleToCall.apply(this, args)
        this.cstPostNonTerminal(
          ruleResult,
          options !== undefined && options.LABEL !== undefined ? options.LABEL : ruleToCall.ruleName,
        )
        return ruleResult
      } catch (e) {
        throw this.subruleInternalError(e, options, ruleToCall.ruleName)
      }
    }
    subruleInternalError(e, options, ruleName) {
      if (isRecognitionException(e) && e.partialCstResult !== undefined) {
        this.cstPostNonTerminal(
          e.partialCstResult,
          options !== undefined && options.LABEL !== undefined ? options.LABEL : ruleName,
        )
        delete e.partialCstResult
      }
      throw e
    }
    consumeInternal(tokType, idx, options) {
      let consumedToken
      try {
        const nextToken = this.LA(1)
        if (this.tokenMatcher(nextToken, tokType) === true) {
          this.consumeToken()
          consumedToken = nextToken
        } else {
          this.consumeInternalError(tokType, nextToken, options)
        }
      } catch (eFromConsumption) {
        consumedToken = this.consumeInternalRecovery(tokType, idx, eFromConsumption)
      }
      this.cstPostTerminal(
        options !== undefined && options.LABEL !== undefined ? options.LABEL : tokType.name,
        consumedToken,
      )
      return consumedToken
    }
    consumeInternalError(tokType, nextToken, options) {
      let msg
      const previousToken = this.LA(0)
      if (options !== undefined && options.ERR_MSG) {
        msg = options.ERR_MSG
      } else {
        msg = this.errorMessageProvider.buildMismatchTokenMessage({
          expected: tokType,
          actual: nextToken,
          previous: previousToken,
          ruleName: this.getCurrRuleFullName(),
        })
      }
      throw this.SAVE_ERROR(new MismatchedTokenException(msg, nextToken, previousToken))
    }
    consumeInternalRecovery(tokType, idx, eFromConsumption) {
      // no recovery allowed during backtracking, otherwise backtracking may recover invalid syntax and accept it
      // but the original syntax could have been parsed successfully without any backtracking + recovery
      if (
        this.recoveryEnabled &&
        // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
        eFromConsumption.name === 'MismatchedTokenException' &&
        !this.isBackTracking()
      ) {
        const follows = this.getFollowsForInRuleRecovery(tokType, idx)
        try {
          return this.tryInRuleRecovery(tokType, follows)
        } catch (eFromInRuleRecovery) {
          if (eFromInRuleRecovery.name === IN_RULE_RECOVERY_EXCEPTION) {
            // failed in RuleRecovery.
            // throw the original error in order to trigger reSync error recovery
            throw eFromConsumption
          } else {
            throw eFromInRuleRecovery
          }
        }
      } else {
        throw eFromConsumption
      }
    }
    saveRecogState() {
      // errors is a getter which will clone the errors array
      const savedErrors = this.errors
      const savedRuleStack = clone(this.RULE_STACK)
      return {
        errors: savedErrors,
        lexerState: this.exportLexerState(),
        RULE_STACK: savedRuleStack,
        CST_STACK: this.CST_STACK,
      }
    }
    reloadRecogState(newState) {
      this.errors = newState.errors
      this.importLexerState(newState.lexerState)
      this.RULE_STACK = newState.RULE_STACK
    }
    ruleInvocationStateUpdate(shortName, fullName, idxInCallingRule) {
      this.RULE_OCCURRENCE_STACK.push(idxInCallingRule)
      this.RULE_STACK.push(shortName)
      // NOOP when cst is disabled
      this.cstInvocationStateUpdate(fullName)
    }
    isBackTracking() {
      return this.isBackTrackingStack.length !== 0
    }
    getCurrRuleFullName() {
      const shortName = this.getLastExplicitRuleShortName()
      return this.shortRuleNameToFull[shortName]
    }
    shortRuleNameToFullName(shortName) {
      return this.shortRuleNameToFull[shortName]
    }
    isAtEndOfInput() {
      return this.tokenMatcher(this.LA(1), EOF)
    }
    reset() {
      this.resetLexerState()
      this.subruleIdx = 0
      this.isBackTrackingStack = []
      this.errors = []
      this.RULE_STACK = []
      // TODO: extract a specific reset for TreeBuilder trait
      this.CST_STACK = []
      this.RULE_OCCURRENCE_STACK = []
    }
  }

  /**
   * Trait responsible for runtime parsing errors.
   */
  class ErrorHandler {
    initErrorHandler(config) {
      this._errors = []
      this.errorMessageProvider = has(config, 'errorMessageProvider')
        ? config.errorMessageProvider // assumes end user provides the correct config value/type
        : DEFAULT_PARSER_CONFIG.errorMessageProvider
    }
    SAVE_ERROR(error) {
      if (isRecognitionException(error)) {
        error.context = {
          ruleStack: this.getHumanReadableRuleStack(),
          ruleOccurrenceStack: clone(this.RULE_OCCURRENCE_STACK),
        }
        this._errors.push(error)
        return error
      } else {
        throw Error('Trying to save an Error which is not a RecognitionException')
      }
    }
    get errors() {
      return clone(this._errors)
    }
    set errors(newErrors) {
      this._errors = newErrors
    }
    // TODO: consider caching the error message computed information
    raiseEarlyExitException(occurrence, prodType, userDefinedErrMsg) {
      const ruleName = this.getCurrRuleFullName()
      const ruleGrammar = this.getGAstProductions()[ruleName]
      const lookAheadPathsPerAlternative = getLookaheadPathsForOptionalProd(
        occurrence,
        ruleGrammar,
        prodType,
        this.maxLookahead,
      )
      const insideProdPaths = lookAheadPathsPerAlternative[0]
      const actualTokens = []
      for (let i = 1; i <= this.maxLookahead; i++) {
        actualTokens.push(this.LA(i))
      }
      const msg = this.errorMessageProvider.buildEarlyExitMessage({
        expectedIterationPaths: insideProdPaths,
        actual: actualTokens,
        previous: this.LA(0),
        customUserDescription: userDefinedErrMsg,
        ruleName: ruleName,
      })
      throw this.SAVE_ERROR(new EarlyExitException(msg, this.LA(1), this.LA(0)))
    }
    // TODO: consider caching the error message computed information
    raiseNoAltException(occurrence, errMsgTypes) {
      const ruleName = this.getCurrRuleFullName()
      const ruleGrammar = this.getGAstProductions()[ruleName]
      // TODO: getLookaheadPathsForOr can be slow for large enough maxLookahead and certain grammars, consider caching ?
      const lookAheadPathsPerAlternative = getLookaheadPathsForOr(occurrence, ruleGrammar, this.maxLookahead)
      const actualTokens = []
      for (let i = 1; i <= this.maxLookahead; i++) {
        actualTokens.push(this.LA(i))
      }
      const previousToken = this.LA(0)
      const errMsg = this.errorMessageProvider.buildNoViableAltMessage({
        expectedPathsPerAlt: lookAheadPathsPerAlternative,
        actual: actualTokens,
        previous: previousToken,
        customUserDescription: errMsgTypes,
        ruleName: this.getCurrRuleFullName(),
      })
      throw this.SAVE_ERROR(new NoViableAltException(errMsg, this.LA(1), previousToken))
    }
  }

  class ContentAssist {
    initContentAssist() {}
    computeContentAssist(startRuleName, precedingInput) {
      const startRuleGast = this.gastProductionsCache[startRuleName]
      if (isUndefined(startRuleGast)) {
        throw Error(`Rule ->${startRuleName}<- does not exist in this grammar.`)
      }
      return nextPossibleTokensAfter([startRuleGast], precedingInput, this.tokenMatcher, this.maxLookahead)
    }
    // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
    // TODO: should this be more explicitly part of the public API?
    getNextPossibleTokenTypes(grammarPath) {
      const topRuleName = head(grammarPath.ruleStack)
      const gastProductions = this.getGAstProductions()
      const topProduction = gastProductions[topRuleName]
      const nextPossibleTokenTypes = new NextAfterTokenWalker(topProduction, grammarPath).startWalking()
      return nextPossibleTokenTypes
    }
  }

  const RECORDING_NULL_OBJECT = {
    description: 'This Object indicates the Parser is during Recording Phase',
  }
  Object.freeze(RECORDING_NULL_OBJECT)
  const HANDLE_SEPARATOR = true
  const MAX_METHOD_IDX = Math.pow(2, BITS_FOR_OCCURRENCE_IDX) - 1
  const RFT = createToken({ name: 'RECORDING_PHASE_TOKEN', pattern: Lexer.NA })
  augmentTokenTypes([RFT])
  const RECORDING_PHASE_TOKEN = createTokenInstance(
    RFT,
    'This IToken indicates the Parser is in Recording Phase\n\t' +
      '' +
      'See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details',
    // Using "-1" instead of NaN (as in EOF) because an actual number is less likely to
    // cause errors if the output of LA or CONSUME would be (incorrectly) used during the recording phase.
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
  )
  Object.freeze(RECORDING_PHASE_TOKEN)
  const RECORDING_PHASE_CSTNODE = {
    name:
      'This CSTNode indicates the Parser is in Recording Phase\n\t' +
      'See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details',
    children: {},
  }
  /**
   * This trait handles the creation of the GAST structure for Chevrotain Grammars
   */
  class GastRecorder {
    initGastRecorder(config) {
      this.recordingProdStack = []
      this.RECORDING_PHASE = false
    }
    enableRecording() {
      this.RECORDING_PHASE = true
      this.TRACE_INIT('Enable Recording', () => {
        /**
         * Warning Dark Voodoo Magic upcoming!
         * We are "replacing" the public parsing DSL methods API
         * With **new** alternative implementations on the Parser **instance**
         *
         * So far this is the only way I've found to avoid performance regressions during parsing time.
         * - Approx 30% performance regression was measured on Chrome 75 Canary when attempting to replace the "internal"
         *   implementations directly instead.
         */
        for (let i = 0; i < 10; i++) {
          const idx = i > 0 ? i : ''
          this[`CONSUME${idx}`] = function (arg1, arg2) {
            return this.consumeInternalRecord(arg1, i, arg2)
          }
          this[`SUBRULE${idx}`] = function (arg1, arg2) {
            return this.subruleInternalRecord(arg1, i, arg2)
          }
          this[`OPTION${idx}`] = function (arg1) {
            return this.optionInternalRecord(arg1, i)
          }
          this[`OR${idx}`] = function (arg1) {
            return this.orInternalRecord(arg1, i)
          }
          this[`MANY${idx}`] = function (arg1) {
            this.manyInternalRecord(i, arg1)
          }
          this[`MANY_SEP${idx}`] = function (arg1) {
            this.manySepFirstInternalRecord(i, arg1)
          }
          this[`AT_LEAST_ONE${idx}`] = function (arg1) {
            this.atLeastOneInternalRecord(i, arg1)
          }
          this[`AT_LEAST_ONE_SEP${idx}`] = function (arg1) {
            this.atLeastOneSepFirstInternalRecord(i, arg1)
          }
        }
        // DSL methods with the idx(suffix) as an argument
        this[`consume`] = function (idx, arg1, arg2) {
          return this.consumeInternalRecord(arg1, idx, arg2)
        }
        this[`subrule`] = function (idx, arg1, arg2) {
          return this.subruleInternalRecord(arg1, idx, arg2)
        }
        this[`option`] = function (idx, arg1) {
          return this.optionInternalRecord(arg1, idx)
        }
        this[`or`] = function (idx, arg1) {
          return this.orInternalRecord(arg1, idx)
        }
        this[`many`] = function (idx, arg1) {
          this.manyInternalRecord(idx, arg1)
        }
        this[`atLeastOne`] = function (idx, arg1) {
          this.atLeastOneInternalRecord(idx, arg1)
        }
        this.ACTION = this.ACTION_RECORD
        this.BACKTRACK = this.BACKTRACK_RECORD
        this.LA = this.LA_RECORD
      })
    }
    disableRecording() {
      this.RECORDING_PHASE = false
      // By deleting these **instance** properties, any future invocation
      // will be deferred to the original methods on the **prototype** object
      // This seems to get rid of any incorrect optimizations that V8 may
      // do during the recording phase.
      this.TRACE_INIT('Deleting Recording methods', () => {
        const that = this
        for (let i = 0; i < 10; i++) {
          const idx = i > 0 ? i : ''
          delete that[`CONSUME${idx}`]
          delete that[`SUBRULE${idx}`]
          delete that[`OPTION${idx}`]
          delete that[`OR${idx}`]
          delete that[`MANY${idx}`]
          delete that[`MANY_SEP${idx}`]
          delete that[`AT_LEAST_ONE${idx}`]
          delete that[`AT_LEAST_ONE_SEP${idx}`]
        }
        delete that[`consume`]
        delete that[`subrule`]
        delete that[`option`]
        delete that[`or`]
        delete that[`many`]
        delete that[`atLeastOne`]
        delete that.ACTION
        delete that.BACKTRACK
        delete that.LA
      })
    }
    //   Parser methods are called inside an ACTION?
    //   Maybe try/catch/finally on ACTIONS while disabling the recorders state changes?
    // @ts-expect-error -- noop place holder
    ACTION_RECORD(impl) {
      // NO-OP during recording
    }
    // Executing backtracking logic will break our recording logic assumptions
    BACKTRACK_RECORD(grammarRule, args) {
      return () => true
    }
    // LA is part of the official API and may be used for custom lookahead logic
    // by end users who may forget to wrap it in ACTION or inside a GATE
    LA_RECORD(howMuch) {
      // We cannot use the RECORD_PHASE_TOKEN here because someone may depend
      // On LA return EOF at the end of the input so an infinite loop may occur.
      return END_OF_FILE
    }
    topLevelRuleRecord(name, def) {
      try {
        const newTopLevelRule = new Rule({ definition: [], name: name })
        newTopLevelRule.name = name
        this.recordingProdStack.push(newTopLevelRule)
        def.call(this)
        this.recordingProdStack.pop()
        return newTopLevelRule
      } catch (originalError) {
        if (originalError.KNOWN_RECORDER_ERROR !== true) {
          try {
            originalError.message =
              originalError.message +
              '\n\t This error was thrown during the "grammar recording phase" For more info see:\n\t' +
              'https://chevrotain.io/docs/guide/internals.html#grammar-recording'
          } catch (mutabilityError) {
            // We may not be able to modify the original error object
            throw originalError
          }
        }
        throw originalError
      }
    }
    // Implementation of parsing DSL
    optionInternalRecord(actionORMethodDef, occurrence) {
      return recordProd.call(this, Option, actionORMethodDef, occurrence)
    }
    atLeastOneInternalRecord(occurrence, actionORMethodDef) {
      recordProd.call(this, RepetitionMandatory, actionORMethodDef, occurrence)
    }
    atLeastOneSepFirstInternalRecord(occurrence, options) {
      recordProd.call(this, RepetitionMandatoryWithSeparator, options, occurrence, HANDLE_SEPARATOR)
    }
    manyInternalRecord(occurrence, actionORMethodDef) {
      recordProd.call(this, Repetition, actionORMethodDef, occurrence)
    }
    manySepFirstInternalRecord(occurrence, options) {
      recordProd.call(this, RepetitionWithSeparator, options, occurrence, HANDLE_SEPARATOR)
    }
    orInternalRecord(altsOrOpts, occurrence) {
      return recordOrProd.call(this, altsOrOpts, occurrence)
    }
    subruleInternalRecord(ruleToCall, occurrence, options) {
      assertMethodIdxIsValid(occurrence)
      if (!ruleToCall || has(ruleToCall, 'ruleName') === false) {
        const error = new Error(
          `<SUBRULE${getIdxSuffix(occurrence)}> argument is invalid` +
            ` expecting a Parser method reference but got: <${JSON.stringify(ruleToCall)}>` +
            `\n inside top level rule: <${this.recordingProdStack[0].name}>`,
        )
        error.KNOWN_RECORDER_ERROR = true
        throw error
      }
      const prevProd = last(this.recordingProdStack)
      const ruleName = ruleToCall.ruleName
      const newNoneTerminal = new NonTerminal({
        idx: occurrence,
        nonTerminalName: ruleName,
        label: options === null || options === void 0 ? void 0 : options.LABEL,
        // The resolving of the `referencedRule` property will be done once all the Rule's GASTs have been created
        referencedRule: undefined,
      })
      prevProd.definition.push(newNoneTerminal)
      return this.outputCst ? RECORDING_PHASE_CSTNODE : RECORDING_NULL_OBJECT
    }
    consumeInternalRecord(tokType, occurrence, options) {
      assertMethodIdxIsValid(occurrence)
      if (!hasShortKeyProperty(tokType)) {
        const error = new Error(
          `<CONSUME${getIdxSuffix(occurrence)}> argument is invalid` +
            ` expecting a TokenType reference but got: <${JSON.stringify(tokType)}>` +
            `\n inside top level rule: <${this.recordingProdStack[0].name}>`,
        )
        error.KNOWN_RECORDER_ERROR = true
        throw error
      }
      const prevProd = last(this.recordingProdStack)
      const newNoneTerminal = new Terminal({
        idx: occurrence,
        terminalType: tokType,
        label: options === null || options === void 0 ? void 0 : options.LABEL,
      })
      prevProd.definition.push(newNoneTerminal)
      return RECORDING_PHASE_TOKEN
    }
  }
  function recordProd(prodConstructor, mainProdArg, occurrence, handleSep = false) {
    assertMethodIdxIsValid(occurrence)
    const prevProd = last(this.recordingProdStack)
    const grammarAction = isFunction(mainProdArg) ? mainProdArg : mainProdArg.DEF
    const newProd = new prodConstructor({ definition: [], idx: occurrence })
    if (handleSep) {
      newProd.separator = mainProdArg.SEP
    }
    if (has(mainProdArg, 'MAX_LOOKAHEAD')) {
      newProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD
    }
    this.recordingProdStack.push(newProd)
    grammarAction.call(this)
    prevProd.definition.push(newProd)
    this.recordingProdStack.pop()
    return RECORDING_NULL_OBJECT
  }
  function recordOrProd(mainProdArg, occurrence) {
    assertMethodIdxIsValid(occurrence)
    const prevProd = last(this.recordingProdStack)
    // Only an array of alternatives
    const hasOptions = isArray$1(mainProdArg) === false
    const alts = hasOptions === false ? mainProdArg : mainProdArg.DEF
    const newOrProd = new Alternation({
      definition: [],
      idx: occurrence,
      ignoreAmbiguities: hasOptions && mainProdArg.IGNORE_AMBIGUITIES === true,
    })
    if (has(mainProdArg, 'MAX_LOOKAHEAD')) {
      newOrProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD
    }
    const hasPredicates = some(alts, (currAlt) => isFunction(currAlt.GATE))
    newOrProd.hasPredicates = hasPredicates
    prevProd.definition.push(newOrProd)
    forEach(alts, (currAlt) => {
      const currAltFlat = new Alternative({ definition: [] })
      newOrProd.definition.push(currAltFlat)
      if (has(currAlt, 'IGNORE_AMBIGUITIES')) {
        currAltFlat.ignoreAmbiguities = currAlt.IGNORE_AMBIGUITIES // assumes end user provides the correct config value/type
      }
      // **implicit** ignoreAmbiguities due to usage of gate
      else if (has(currAlt, 'GATE')) {
        currAltFlat.ignoreAmbiguities = true
      }
      this.recordingProdStack.push(currAltFlat)
      currAlt.ALT.call(this)
      this.recordingProdStack.pop()
    })
    return RECORDING_NULL_OBJECT
  }
  function getIdxSuffix(idx) {
    return idx === 0 ? '' : `${idx}`
  }
  function assertMethodIdxIsValid(idx) {
    if (idx < 0 || idx > MAX_METHOD_IDX) {
      const error = new Error(
        // The stack trace will contain all the needed details
        `Invalid DSL Method idx value: <${idx}>\n\t` +
          `Idx value must be a none negative value smaller than ${MAX_METHOD_IDX + 1}`,
      )
      error.KNOWN_RECORDER_ERROR = true
      throw error
    }
  }

  /**
   * Trait responsible for runtime parsing errors.
   */
  class PerformanceTracer {
    initPerformanceTracer(config) {
      if (has(config, 'traceInitPerf')) {
        const userTraceInitPerf = config.traceInitPerf
        const traceIsNumber = typeof userTraceInitPerf === 'number'
        this.traceInitMaxIdent = traceIsNumber ? userTraceInitPerf : Infinity
        this.traceInitPerf = traceIsNumber ? userTraceInitPerf > 0 : userTraceInitPerf // assumes end user provides the correct config value/type
      } else {
        this.traceInitMaxIdent = 0
        this.traceInitPerf = DEFAULT_PARSER_CONFIG.traceInitPerf
      }
      this.traceInitIndent = -1
    }
    TRACE_INIT(phaseDesc, phaseImpl) {
      // No need to optimize this using NOOP pattern because
      // It is not called in a hot spot...
      if (this.traceInitPerf === true) {
        this.traceInitIndent++
        const indent = new Array(this.traceInitIndent + 1).join('\t')
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          console.log(`${indent}--> <${phaseDesc}>`)
        }
        const { time, value } = timer(phaseImpl)
        /* istanbul ignore next - Difficult to reproduce specific performance behavior (>10ms) in tests */
        const traceMethod = time > 10 ? console.warn : console.log
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`)
        }
        this.traceInitIndent--
        return value
      } else {
        return phaseImpl()
      }
    }
  }

  function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach((baseCtor) => {
      const baseProto = baseCtor.prototype
      Object.getOwnPropertyNames(baseProto).forEach((propName) => {
        if (propName === 'constructor') {
          return
        }
        const basePropDescriptor = Object.getOwnPropertyDescriptor(baseProto, propName)
        // Handle Accessors
        if (basePropDescriptor && (basePropDescriptor.get || basePropDescriptor.set)) {
          Object.defineProperty(derivedCtor.prototype, propName, basePropDescriptor)
        } else {
          derivedCtor.prototype[propName] = baseCtor.prototype[propName]
        }
      })
    })
  }

  const END_OF_FILE = createTokenInstance(EOF, '', NaN, NaN, NaN, NaN, NaN, NaN)
  Object.freeze(END_OF_FILE)
  const DEFAULT_PARSER_CONFIG = Object.freeze({
    recoveryEnabled: false,
    maxLookahead: 3,
    dynamicTokensEnabled: false,
    outputCst: true,
    errorMessageProvider: defaultParserErrorProvider,
    nodeLocationTracking: 'none',
    traceInitPerf: false,
    skipValidations: false,
  })
  const DEFAULT_RULE_CONFIG = Object.freeze({
    recoveryValueFunc: () => undefined,
    resyncEnabled: true,
  })
  var ParserDefinitionErrorType
  ;(function (ParserDefinitionErrorType) {
    ParserDefinitionErrorType[(ParserDefinitionErrorType['INVALID_RULE_NAME'] = 0)] = 'INVALID_RULE_NAME'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['DUPLICATE_RULE_NAME'] = 1)] = 'DUPLICATE_RULE_NAME'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['INVALID_RULE_OVERRIDE'] = 2)] = 'INVALID_RULE_OVERRIDE'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['DUPLICATE_PRODUCTIONS'] = 3)] = 'DUPLICATE_PRODUCTIONS'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['UNRESOLVED_SUBRULE_REF'] = 4)] = 'UNRESOLVED_SUBRULE_REF'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['LEFT_RECURSION'] = 5)] = 'LEFT_RECURSION'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['NONE_LAST_EMPTY_ALT'] = 6)] = 'NONE_LAST_EMPTY_ALT'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['AMBIGUOUS_ALTS'] = 7)] = 'AMBIGUOUS_ALTS'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['CONFLICT_TOKENS_RULES_NAMESPACE'] = 8)] =
      'CONFLICT_TOKENS_RULES_NAMESPACE'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['INVALID_TOKEN_NAME'] = 9)] = 'INVALID_TOKEN_NAME'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['NO_NON_EMPTY_LOOKAHEAD'] = 10)] = 'NO_NON_EMPTY_LOOKAHEAD'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['AMBIGUOUS_PREFIX_ALTS'] = 11)] = 'AMBIGUOUS_PREFIX_ALTS'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['TOO_MANY_ALTS'] = 12)] = 'TOO_MANY_ALTS'
    ParserDefinitionErrorType[(ParserDefinitionErrorType['CUSTOM_LOOKAHEAD_VALIDATION'] = 13)] =
      'CUSTOM_LOOKAHEAD_VALIDATION'
  })(ParserDefinitionErrorType || (ParserDefinitionErrorType = {}))
  class Parser {
    /**
     *  @deprecated use the **instance** method with the same name instead
     */
    static performSelfAnalysis(parserInstance) {
      throw Error(
        'The **static** `performSelfAnalysis` method has been deprecated.' +
          '\t\nUse the **instance** method with the same name instead.',
      )
    }
    performSelfAnalysis() {
      this.TRACE_INIT('performSelfAnalysis', () => {
        let defErrorsMsgs
        this.selfAnalysisDone = true
        const className = this.className
        this.TRACE_INIT('toFastProps', () => {
          // Without this voodoo magic the parser would be x3-x4 slower
          // It seems it is better to invoke `toFastProperties` **before**
          // Any manipulations of the `this` object done during the recording phase.
          toFastProperties(this)
        })
        this.TRACE_INIT('Grammar Recording', () => {
          try {
            this.enableRecording()
            // Building the GAST
            forEach(this.definedRulesNames, (currRuleName) => {
              const wrappedRule = this[currRuleName]
              const originalGrammarAction = wrappedRule['originalGrammarAction']
              let recordedRuleGast
              this.TRACE_INIT(`${currRuleName} Rule`, () => {
                recordedRuleGast = this.topLevelRuleRecord(currRuleName, originalGrammarAction)
              })
              this.gastProductionsCache[currRuleName] = recordedRuleGast
            })
          } finally {
            this.disableRecording()
          }
        })
        let resolverErrors = []
        this.TRACE_INIT('Grammar Resolving', () => {
          resolverErrors = resolveGrammar({
            rules: values(this.gastProductionsCache),
          })
          this.definitionErrors = this.definitionErrors.concat(resolverErrors)
        })
        this.TRACE_INIT('Grammar Validations', () => {
          // only perform additional grammar validations IFF no resolving errors have occurred.
          // as unresolved grammar may lead to unhandled runtime exceptions in the follow up validations.
          if (isEmpty(resolverErrors) && this.skipValidations === false) {
            const validationErrors = validateGrammar({
              rules: values(this.gastProductionsCache),
              tokenTypes: values(this.tokensMap),
              errMsgProvider: defaultGrammarValidatorErrorProvider,
              grammarName: className,
            })
            const lookaheadValidationErrors = validateLookahead({
              lookaheadStrategy: this.lookaheadStrategy,
              rules: values(this.gastProductionsCache),
              tokenTypes: values(this.tokensMap),
              grammarName: className,
            })
            this.definitionErrors = this.definitionErrors.concat(validationErrors, lookaheadValidationErrors)
          }
        })
        // this analysis may fail if the grammar is not perfectly valid
        if (isEmpty(this.definitionErrors)) {
          // The results of these computations are not needed unless error recovery is enabled.
          if (this.recoveryEnabled) {
            this.TRACE_INIT('computeAllProdsFollows', () => {
              const allFollows = computeAllProdsFollows(values(this.gastProductionsCache))
              this.resyncFollows = allFollows
            })
          }
          this.TRACE_INIT('ComputeLookaheadFunctions', () => {
            var _a, _b
            ;(_b = (_a = this.lookaheadStrategy).initialize) === null || _b === void 0
              ? void 0
              : _b.call(_a, {
                  rules: values(this.gastProductionsCache),
                })
            this.preComputeLookaheadFunctions(values(this.gastProductionsCache))
          })
        }
        if (!Parser.DEFER_DEFINITION_ERRORS_HANDLING && !isEmpty(this.definitionErrors)) {
          defErrorsMsgs = map(this.definitionErrors, (defError) => defError.message)
          throw new Error(
            `Parser Definition Errors detected:\n ${defErrorsMsgs.join('\n-------------------------------\n')}`,
          )
        }
      })
    }
    constructor(tokenVocabulary, config) {
      this.definitionErrors = []
      this.selfAnalysisDone = false
      const that = this
      that.initErrorHandler(config)
      that.initLexerAdapter()
      that.initLooksAhead(config)
      that.initRecognizerEngine(tokenVocabulary, config)
      that.initRecoverable(config)
      that.initTreeBuilder(config)
      that.initContentAssist()
      that.initGastRecorder(config)
      that.initPerformanceTracer(config)
      if (has(config, 'ignoredIssues')) {
        throw new Error(
          'The <ignoredIssues> IParserConfig property has been deprecated.\n\t' +
            'Please use the <IGNORE_AMBIGUITIES> flag on the relevant DSL method instead.\n\t' +
            'See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#IGNORING_AMBIGUITIES\n\t' +
            'For further details.',
        )
      }
      this.skipValidations = has(config, 'skipValidations')
        ? config.skipValidations // casting assumes the end user passing the correct type
        : DEFAULT_PARSER_CONFIG.skipValidations
    }
  }
  // Set this flag to true if you don't want the Parser to throw error when problems in it's definition are detected.
  // (normally during the parser's constructor).
  // This is a design time flag, it will not affect the runtime error handling of the parser, just design time errors,
  // for example: duplicate rule names, referencing an unresolved subrule, ect...
  // This flag should not be enabled during normal usage, it is used in special situations, for example when
  // needing to display the parser definition errors in some GUI(online playground).
  Parser.DEFER_DEFINITION_ERRORS_HANDLING = false
  applyMixins(Parser, [
    Recoverable,
    LooksAhead,
    TreeBuilder,
    LexerAdapter,
    RecognizerEngine,
    RecognizerApi,
    ErrorHandler,
    ContentAssist,
    GastRecorder,
    PerformanceTracer,
  ])
  class CstParser extends Parser {
    constructor(tokenVocabulary, config = DEFAULT_PARSER_CONFIG) {
      const configClone = clone(config)
      configClone.outputCst = true
      super(tokenVocabulary, configClone)
    }
  }

  return { CstParser, Lexer, createToken }
})()

export { CstParser, Lexer, createToken }
