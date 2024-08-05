import { version } from "./constants";

/** uv2 renamed to uv1 in r125
 * 
 * https://github.com/mrdoob/three.js/pull/25943
*/
export const UV1 = version >= 125 ? 'uv1' : 'uv2'