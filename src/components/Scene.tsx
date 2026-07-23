import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats, Center, Bounds  } from '@react-three/drei'
import { Suspense } from 'react'
import { Model } from './Model'

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <color attach="background" args={['#abbbb8']} />
      <Suspense fallback={null}>
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
