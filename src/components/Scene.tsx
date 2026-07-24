import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats, Center, Bounds  } from '@react-three/drei'
import { Suspense } from 'react'
import { Model } from './Model'

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <color attach="background" args={['#abbbb8']} />
      <fog attach="fog" args={['#abbbb8', 10, 20]} />

      <Suspense fallback={null}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
          {/* args={[width, height]} */}
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="gray" />
        </mesh>
        <Bounds fit clip observe margin={1.2}>
          <Center>
            <Model />
          </Center>
        </Bounds>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls />
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  )
}
