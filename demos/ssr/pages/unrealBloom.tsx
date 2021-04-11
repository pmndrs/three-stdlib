import * as THREE from 'three'
import React, { useRef, useState, useMemo, useEffect, FC } from 'react'
import { Canvas, extend, useThree, useFrame, ReactThreeFiber } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from '../../../dist'

extend({ EffectComposer, RenderPass, UnrealBloomPass })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Node<EffectComposer, typeof EffectComposer>
      renderPass: ReactThreeFiber.Node<RenderPass, typeof RenderPass>
      unrealBloomPass: ReactThreeFiber.Node<UnrealBloomPass, typeof UnrealBloomPass>
    }
  }
}

interface SphereProps {
  geometry: THREE.BufferGeometry
  x: number
  y: number
  z: number
  s: number
}

const Sphere = ({ geometry, x, y, z, s }: SphereProps): JSX.Element => {
  const ref = useRef<THREE.Mesh>()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = x + Math.sin((state.clock.getElapsedTime() * s) / 2)
      ref.current.position.y = y + Math.sin((state.clock.getElapsedTime() * s) / 2)
      ref.current.position.z = z + Math.sin((state.clock.getElapsedTime() * s) / 2)
    }
  })
  return (
    <mesh ref={ref} position={[x, y, z]} scale={[s, s, s]} geometry={geometry}>
      <meshStandardMaterial color="hotpink" roughness={1} />
    </mesh>
  )
}

const RandomSpheres = (): JSX.Element => {
  const [geometry] = useState(() => new THREE.SphereGeometry(1, 32, 32))
  const data = useMemo(() => {
    return new Array(15).fill(0).map(() => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      s: Math.random() + 10,
    }))
  }, [])
  return (
    <>
      {data.map((props, i) => (
        <Sphere key={i} {...props} geometry={geometry} />
      ))}
    </>
  )
}

const Bloom: FC = ({ children }) => {
  const { gl, camera, size } = useThree()
  const [scene, setScene] = useState()
  const composer = useRef<EffectComposer>()
  useEffect(() => {
    if (composer.current && scene) {
      composer.current.setSize(size.width, size.height)
    }
  }, [size, scene])
  useFrame(() => {
    if (scene && composer.current) {
      composer.current.render()
    }
  }, 1)
  return (
    <>
      <scene ref={setScene}>{children}</scene>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <unrealBloomPass attachArray="passes" args={[new THREE.Vector2(0, 0), 1.5, 1, 0]} />
      </effectComposer>
    </>
  )
}

const Main: FC = ({ children }) => {
  const scene = useRef<THREE.Scene>()
  const { gl, camera } = useThree()
  useFrame(() => {
    gl.autoClear = false
    gl.clearDepth()
    if (scene.current) {
      gl.render(scene.current, camera)
    }
  }, 2)
  return <scene ref={scene}>{children}</scene>
}

const UnrealBloomPage: FC = () => {
  return (
    <Canvas linear camera={{ position: [0, 0, 120] }}>
      <Main>
        <pointLight />
        <ambientLight />
        <RandomSpheres />
      </Main>
      <Bloom>
        <ambientLight />
        <RandomSpheres />
      </Bloom>
    </Canvas>
  )
}

export default UnrealBloomPage
