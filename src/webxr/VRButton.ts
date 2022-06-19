import { Navigator, WebGLRenderer, XRSession, XRSessionInit } from 'three'

class VRButton {
  static createButton(renderer: WebGLRenderer, sessionInit: XRSessionInit = {}): HTMLButtonElement | HTMLAnchorElement {
    const button = document.createElement('button')

    function showEnterVR(/*device*/): void {
      let currentSession: XRSession | null = null

      async function onSessionStarted(session: XRSession): Promise<void> {
        session.addEventListener('end', onSessionEnded)

        await renderer.xr.setSession(session)
        button.textContent = 'EXIT VR'

        currentSession = session
      }

      function onSessionEnded(/*event*/): void {
        currentSession!.removeEventListener('end', onSessionEnded)

        button.textContent = 'ENTER VR'

        currentSession = null
      }

      //

      button.style.display = ''

      button.style.cursor = 'pointer'
      button.style.left = 'calc(50% - 50px)'
      button.style.width = '100px'

      button.textContent = 'ENTER VR'

      button.onmouseenter = (): void => {
        button.style.opacity = '1.0'
      }

      button.onmouseleave = (): void => {
        button.style.opacity = '0.5'
      }

      button.onclick = (): void => {
        if (currentSession === null) {
          // WebXR's requestReferenceSpace only works if the corresponding feature
          // was requested at session creation time. For simplicity, just ask for
          // the interesting ones as optional features, but be aware that the
          // requestReferenceSpace call will fail if it turns out to be unavailable.
          // ('local' is always available for immersive sessions and doesn't need to
          // be requested separately.)

          const optionalFeatures = [sessionInit.optionalFeatures, 'local-floor', 'bounded-floor', 'hand-tracking']
            .flat()
            .filter(Boolean) as string[]

          ;(navigator as Navigator).xr
            ?.requestSession('immersive-vr', { ...sessionInit, optionalFeatures })
            .then(onSessionStarted)
        } else {
          currentSession.end()
        }
      }
    }

    function disableButton(): void {
      button.style.display = ''

      button.style.cursor = 'auto'
      button.style.left = 'calc(50% - 75px)'
      button.style.width = '150px'

      button.onmouseenter = null
      button.onmouseleave = null

      button.onclick = null
    }

    function showWebXRNotFound(): void {
      disableButton()

      button.textContent = 'VR NOT SUPPORTED'
    }

    function stylizeElement(element: HTMLElement): void {
      element.style.position = 'absolute'
      element.style.bottom = '20px'
      element.style.padding = '12px 6px'
      element.style.border = '1px solid #fff'
      element.style.borderRadius = '4px'
      element.style.background = 'rgba(0,0,0,0.1)'
      element.style.color = '#fff'
      element.style.font = 'normal 13px sans-serif'
      element.style.textAlign = 'center'
      element.style.opacity = '0.5'
      element.style.outline = 'none'
      element.style.zIndex = '999'
    }

    if ('xr' in navigator) {
      stylizeElement(button)
      button.id = 'VRButton'
      button.style.display = 'none'

      // Query for session mode
      ;(navigator as Navigator).xr!.isSessionSupported('immersive-vr').then((supported) => {
        supported ? showEnterVR() : showWebXRNotFound()

        if (supported && VRButton.xrSessionIsGranted) {
          button.click()
        }
      })

      return button
    } else {
      const message = document.createElement('a')

      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, 'https:')
        message.innerHTML = 'WEBXR NEEDS HTTPS' // TODO Improve message
      } else {
        message.href = 'https://immersiveweb.dev/'
        message.innerHTML = 'WEBXR NOT AVAILABLE'
      }

      message.style.left = 'calc(50% - 90px)'
      message.style.width = '180px'
      message.style.textDecoration = 'none'

      stylizeElement(message)

      return message
    }
  }

  static xrSessionIsGranted = false

  static registerSessionGrantedListener(): void {
    if ('xr' in navigator) {
      ;(navigator as Navigator).xr!.addEventListener('sessiongranted', () => {
        VRButton.xrSessionIsGranted = true
      })
    }
  }
}

export { VRButton }
