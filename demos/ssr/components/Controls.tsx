import { useEffect, useState } from 'react'
import { OrbitControls } from 'three-stdlib'
import { useThree } from 'react-three-fiber'

export const Controls = () => {
  const { camera, gl, invalidate } = useThree()

  const [controls, setControls] = useState<OrbitControls>()

  useEffect(() => {
    setControls(new OrbitControls(camera, gl.domElement))
  }, [camera, gl])

  useEffect(() => {
    if (controls) {
      controls.addEventListener('change', invalidate)
    }
    return () => {
      if (controls) {
        controls.removeEventListener('change', invalidate)
      }
    }
  }, [controls, invalidate])

  return <primitive dispose={undefined} object={controls} enableDamping />
}
