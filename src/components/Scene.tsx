import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import { Suspense } from 'react'

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <Suspense fallback={null}>
        {/* Replace this with <Model /> once you run gltfjsx on your .glb */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls />
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  )
}
