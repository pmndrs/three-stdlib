export const Lights = (): JSX.Element => {
  return (
    <group>
      <spotLight position={[-3, 6, -4]} intensity={10} angle={Math.PI / 4} decay={3.5} distance={35} penumbra={2} />
      <pointLight position={[-10, -10, 10]} color="pink" intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.2} />
      <directionalLight position={[0, -5, 0]} color="pink" intensity={2} />
      <ambientLight intensity={0.2} color="white" />
    </group>
  )
}
