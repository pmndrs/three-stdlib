export function decodeText(array) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(array)
  }

  // Avoid the String.fromCharCode.apply(null, array) shortcut, which
  // throws a "maximum call stack size exceeded" error for large arrays.

  let s = ''

  for (let i = 0, il = array.length; i < il; i++) {
    // Implicitly assumes little-endian.
    s += String.fromCharCode(array[i])
  }

  try {
    // merges multi-byte utf-8 characters.

    return decodeURIComponent(escape(s))
  } catch (e) {
    // see https://github.com/mrdoob/three.js/issues/16358

    return s
  }
}
