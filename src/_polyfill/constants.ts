import { REVISION } from 'three'

export const version = /* @__PURE__ */ (() => parseInt(REVISION.replace(/\D+/g, '')))()
