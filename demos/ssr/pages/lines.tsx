import { Canvas } from 'react-three-fiber'
import styled from 'styled-components'

export default function LinesPage(): JSX.Element {
  return (
    <Root>
      <Canvas></Canvas>
    </Root>
  )
}

const Root = styled.main`
  width: 100vw;
  height: 100vh;
`
