export function createAttributesKey(attributes): string {
  let attributesKey = ''

  const keys = Object.keys(attributes).sort()

  for (let i = 0, il = keys.length; i < il; i++) {
    attributesKey += keys[i] + ':' + attributes[keys[i]] + ';'
  }

  return attributesKey
}
