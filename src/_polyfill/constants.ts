import { REVISION } from 'three'

let _version: any = /* @__PURE__ */ REVISION.replace(/\D+/g, '')
_version = /* @__PURE__ */ parseInt(_version)

export const version = _version as number
