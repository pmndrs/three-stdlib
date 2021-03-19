import { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import { Mesh } from 'three'

import { Lights } from './Lights'
import { Controls } from './Controls'

export const Scene = (): JSX.Element => {
  const meshRef = useRef<Mesh>()

  useFrame((_, delta) => {
    const { current: mesh } = meshRef

    if (mesh) {
      mesh.rotation.x += delta
      mesh.rotation.y += delta
    }
  })

  return (
    <>
      <Controls />
      <Lights />
      <mesh ref={meshRef}>
        <icosahedronBufferGeometry args={[1]} />
        <meshStandardMaterial color="pink" roughness={0} />
      </mesh>
    </>
  )
}
