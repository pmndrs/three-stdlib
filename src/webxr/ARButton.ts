import { Navigator, WebGLRenderer, XRSession, XRSessionInit } from 'three'

class ARButton {
  static createButton(renderer: WebGLRenderer, sessionInit: XRSessionInit = {}): HTMLButtonElement | HTMLAnchorElement {
    const button = document.createElement('button')

    function showStartAR(/*device*/): void {
      if ((sessionInit as any).domOverlay === undefined) {
        const overlay = document.createElement('div')
        overlay.style.display = 'none'
        document.body.appendChild(overlay)

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '38px')
        svg.setAttribute('height', '38px')
        svg.style.position = 'absolute'
        svg.style.right = '20px'
        svg.style.top = '20px'
        svg.addEventListener('click', function () {
          currentSession?.end()
        })
        overlay.appendChild(svg)

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28')
        path.setAttribute('stroke', '#fff')
        path.setAttribute('stroke-width', '2px')
        svg.appendChild(path)

        if (sessionInit.optionalFeatures === undefined) {
          sessionInit.optionalFeatures = []
        }

        sessionInit.optionalFeatures.push('dom-overlay')
        ;(sessionInit as any).domOverlay = { root: overlay }
      }

      //

      let currentSession: XRSession | null = null

      async function onSessionStarted(session: XRSession): Promise<void> {
        session.addEventListener('end', onSessionEnded)

        renderer.xr.setReferenceSpaceType('local')

        await renderer.xr.setSession(session)

        button.textContent = 'STOP AR'
        ;(sessionInit as any).domOverlay!.root.style.display = ''

        currentSession = session
      }

      function onSessionEnded(/*event*/): void {
        currentSession!.removeEventListener('end', onSessionEnded)

        button.textContent = 'START AR'
        ;(sessionInit as any).domOverlay!.root.style.display = 'none'

        currentSession = null
      }

      //

      button.style.display = ''

      button.style.cursor = 'pointer'
      button.style.left = 'calc(50% - 50px)'
      button.style.width = '100px'

      button.textContent = 'START AR'

      button.onmouseenter = (): void => {
        button.style.opacity = '1.0'
      }

      button.onmouseleave = (): void => {
        button.style.opacity = '0.5'
      }

      button.onclick = (): void => {
        if (currentSession === null) {
          ;(navigator as Navigator).xr!.requestSession('immersive-ar', sessionInit).then(onSessionStarted)
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

    function showARNotSupported(): void {
      disableButton()

      button.textContent = 'AR NOT SUPPORTED'
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
      button.id = 'ARButton'
      button.style.display = 'none'

      stylizeElement(button)

      // Query for session mode
      ;(navigator as Navigator)
        .xr!.isSessionSupported('immersive-ar')
        .then(function (supported) {
          supported ? showStartAR() : showARNotSupported()
        })
        .catch(showARNotSupported)

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
}

export { ARButton }
