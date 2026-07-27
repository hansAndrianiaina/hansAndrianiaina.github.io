import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats, Center, Bounds  } from '@react-three/drei'
import { Suspense } from 'react'
import { Leva } from 'leva'
import { Model } from './Model'
import CameraDebugPanel from './CameraDebugPanel'
import IntroCamera from './IntroCamera'

import CameraCollisionGuard from './CameraCollisionGuard'
import ControlModeToggle from './ControlModeToggle'

import * as THREE from 'three'
import { useRef } from 'react'

import WalkControls from './WalkControls'

import { DragGuardProvider } from '../interaction/DragGuardContext'
import InteractiveModel from './InteractiveModel'
import { INTERACTABLES } from '../interaction/interactables'

import AnimationInfoPanel from './AnimationInfoPanel'

type ControlMode = 'orbit' | 'walk'

export default function Scene() {
  const [introDone, setIntroDone] = useState(false)
  const modelRef = useRef<THREE.Group>(null)
  const [mode, setMode] = useState<ControlMode>('walk')

  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <Leva hidden={!import.meta.env.DEV} collapsed />
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
        <color attach="background" args={['#abbbb8']} />
        <fog attach="fog" args={['#abbbb8', 10, 20]} />

        <Suspense fallback={null}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
            {/* args={[width, height]} */}
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="gray" />
          </mesh>
          <DragGuardProvider>
            <Bounds fit clip margin={1.2}>
              <group ref={modelRef}>
                <Center>
                  <InteractiveModel onSelect={setSelected} />
                </Center>
              </group>
            </Bounds>
          </DragGuardProvider>
          <Environment preset="city" />
        </Suspense>
          <IntroCamera onComplete={() => setIntroDone(true)} />
          <CameraCollisionGuard targetRef={modelRef} />
          {introDone && mode === 'walk' && <WalkControls />}
          {introDone && mode === 'orbit' && (
            <OrbitControls  
            makeDefault
            enabled={introDone}

            // Rotation limits (vertical / polar angle, in radians)
            minPolarAngle={Math.PI / 2.8}     // how far up you can orbit (0 = straight down from top)
            maxPolarAngle={Math.PI / 1.5}   // how far down (Math.PI = straight from below)

            // // Rotation limits (horizontal / azimuthal angle, in radians)
            // minAzimuthAngle={-Math.PI}  // leftmost rotation
            // maxAzimuthAngle={Math.PI}   // rightmost rotation

            // Zoom / distance limits
            minDistance={0.1}                 // closest you can zoom in
            maxDistance={4}                 // furthest you can zoom out

            // Disable whole interaction types
            enablePan={false}               // no dragging to pan
            enableZoom={true}               // allow/disallow scroll zoom
            enableRotate={true}             // allow/disallow orbit rotation

            // Feel
            enableDamping
            dampingFactor={0.05}
          />)}
          {/* {introDone && <WalkControls />} */}
          {/* {introDone && } */}
          {import.meta.env.DEV && <CameraDebugPanel />}
          {import.meta.env.DEV && <Stats />}
      </Canvas>
      
      {introDone && (
        <ControlModeToggle mode={mode} onChange={setMode} />
      )}
      {introDone && selected && (
        <AnimationInfoPanel
          title={INTERACTABLES[selected].title}
          subtitle={INTERACTABLES[selected].description}
          onClose={() => setSelected(null)}
          visible={introDone}
        />
      )}
    </>
  )
}
