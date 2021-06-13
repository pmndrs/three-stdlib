import { Camera, Scene, PerspectiveCamera, WebGLRenderer, Clock } from 'three'

interface useThreeReturn {
  camera: Camera
  scene: Scene
  renderer: WebGLRenderer
  render: () => void
}

interface useFrameProps {
  clock: Clock
  renderer: WebGLRenderer
}

interface useThreeProps {
  useFrame?: ({ clock, renderer }: useFrameProps, delta: number) => void
  orbit?: boolean
}

export const useThree = ({ useFrame, orbit = true }: useThreeProps = {}): useThreeReturn => {
  const container = document.getElementById('canvas-root') as HTMLCanvasElement

  const renderer = new WebGLRenderer({
    antialias: true,
    canvas: container,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, -5)
  camera.lookAt(0, 0, 0)

  const scene = new Scene()

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  const clock = new Clock()

  function animate() {
    if (useFrame) {
      useFrame(
        {
          renderer,
          clock,
        },
        clock.getDelta(),
      )
    }

    render()

    requestAnimationFrame(animate)
  }

  function render() {
    renderer.render(scene, camera)
  }

  window.addEventListener('resize', onWindowResize)

  animate()

  return {
    camera,
    scene,
    renderer,
    render,
  }
}
