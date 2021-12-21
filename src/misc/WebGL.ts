let webGLAvailable: boolean, webGL2Available: boolean

export function isWebGLAvailable(): boolean {
  if (webGLAvailable !== undefined) return webGLAvailable
  try {
    let gl
    const canvas = document.createElement('canvas')
    webGLAvailable = !!(window.WebGLRenderingContext && (gl = canvas.getContext('webgl')))
    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext()
    return webGLAvailable
  } catch (e) {
    return (webGLAvailable = false)
  }
}

export function isWebGL2Available(): boolean {
  if (webGL2Available !== undefined) return webGL2Available
  try {
    let gl
    const canvas = document.createElement('canvas')
    webGL2Available = !!(window.WebGL2RenderingContext && (gl = canvas.getContext('webgl2')))
    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext()
    return webGL2Available
  } catch (e) {
    return (webGL2Available = false)
  }
}

export function getWebGLErrorMessage(): HTMLDivElement {
  return this.getErrorMessage(1)
}

export function getWebGL2ErrorMessage(): HTMLDivElement {
  return this.getErrorMessage(2)
}

export function getErrorMessage(version: 1 | 2): HTMLDivElement {
  const names = {
    1: 'WebGL',
    2: 'WebGL 2',
  }

  const contexts = {
    1: window.WebGLRenderingContext,
    2: window.WebGL2RenderingContext,
  }

  const element = document.createElement('div')
  element.id = 'webglmessage'
  element.style.fontFamily = 'monospace'
  element.style.fontSize = '13px'
  element.style.fontWeight = 'normal'
  element.style.textAlign = 'center'
  element.style.background = '#fff'
  element.style.color = '#000'
  element.style.padding = '1.5em'
  element.style.width = '400px'
  element.style.margin = '5em auto 0'

  let message =
    'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>'

  if (contexts[version]) {
    message = message.replace('$0', 'graphics card')
  } else {
    message = message.replace('$0', 'browser')
  }

  message = message.replace('$1', names[version])
  element.innerHTML = message
  return element
}
