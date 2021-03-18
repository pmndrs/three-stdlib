import { Canvas } from 'react-three-fiber'
import styled from 'styled-components'

import { Scene } from '../components/Scene'

export default function IndexPage(): JSX.Element {
  return (
    <Root>
      <Canvas>
        <color attach="background" args={[0, 0, 255]} />
        <Scene />
      </Canvas>
    </Root>
  )
}

const Root = styled.main`
  width: 100vw;
  height: 100vh;
`
