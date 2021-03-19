import { Camera, Scene, PerspectiveCamera, WebGLRenderer, Clock } from 'three'
//@ts-ignore
import { OrbitControls } from '../src'

interface useThreeReturn {
  camera: Camera
  scene: Scene
  renderer: WebGLRenderer
}

interface useFrameProps {
  clock: Clock
}

interface useThreeProps {
  useFrame?: ({ clock }: useFrameProps, delta: number) => void
}

export const useThree = ({ useFrame }: useThreeProps = {}): useThreeReturn => {
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

  const controls = new OrbitControls(camera, container)
  controls.enableDamping = true

  function animate() {
    if (useFrame) {
      useFrame(
        {
          clock,
        },
        clock.getDelta(),
      )
    }

    controls.update()

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
  }
}
