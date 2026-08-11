import { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Stats, Center, Bounds  } from '@react-three/drei'
import CameraDebugPanel from './CameraDebugPanel'
import IntroCamera from './IntroCamera'

import CameraCollisionGuard from './CameraCollisionGuard'
import ControlModeToggle from './ControlModeToggle'

import * as THREE from 'three'
import { useRef as useRefReact } from 'react'

import WalkControls from './WalkControls'
import CustomOrbitControls from './CustomOrbitControls'

import { DragGuardProvider } from '../interaction/DragGuardContext'
import InteractiveModel from './InteractiveModel'
import { INTERACTABLES } from '../interaction/interactables'

import AnimationInfoPanel from './AnimationInfoPanel'
import InfoPanel from './InfoPanel'
import ErrorBoundary from './ErrorBoundary'
import LoadingScreen from './LoadingScreen'
import SceneReadySignal from './SceneReadySignal'
import { useSoundPlayer } from './SoundPlayer';

type ControlMode = 'orbit' | 'walk'

const MIN_LOADING_MS = 1000   // loading screen stays up at least this long, even on a warm cache
const MAX_LOADING_MS = 15000  // safety net — reveal anyway if assets never resolve (e.g. network failure)

export default function Scene() {
  const [introDone, setIntroDone] = useState(false)
  const [introKey, setIntroKey] = useState(0)   // bump to force IntroCamera remount
  const modelRef = useRefReact<THREE.Group>(null)
  const [mode, setMode] = useState<ControlMode>('walk')
  const [selected, setSelected] = useState<string | null>(null)

  // Loading screen gating: hidden once BOTH are true.
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const sceneReady = assetsLoaded && minTimeElapsed
  const { play : playAmbientSound } = useSoundPlayer(import.meta.env.BASE_URL + 'sounds/ambient.mp3', { volume: 0.5 });


  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimeElapsed(true), MIN_LOADING_MS)
    const maxTimer = setTimeout(() => setAssetsLoaded(true), MAX_LOADING_MS)
    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [])

  const handleReplay = () => {
    setIntroDone(false)      // unmounts WalkControls/CustomOrbitControls/CollisionGuard
    setIntroKey((k) => k + 1) // remounts IntroCamera fresh
  }

  return (
    <>
      
      <ErrorBoundary
        fallback={
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0b1b24',
              color: '#eafcff',
              fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
              padding: '2rem',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Failed to load 3D scene</h2>
            <p style={{ color: 'rgba(210, 238, 240, 0.7)', margin: 0 }}>
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #d3f6f8 0%, #8fdee6 100%)',
                color: '#0b1b24',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Refresh
            </button>
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0.2, 3], fov: 45 }}>
          {/* <color attach="background" args={['#abbbb8']} /> */}
          {/* <fog attach="fog" args={['#abbbb8', 10, 20]} /> */}

          <Suspense fallback={null}>
            <DragGuardProvider>
              <Bounds clip margin={1.2}>
                <group ref={modelRef}>
                  <Center>
                    <InteractiveModel onSelect={setSelected} />
                  </Center>
                </group>
              </Bounds>
            </DragGuardProvider>
            <Environment preset="city" />
            {/* Fires once everything above has actually resolved (see SceneReadySignal.tsx) */}
            <SceneReadySignal onReady={() => setAssetsLoaded(true)} />
          </Suspense>

          {/* Held back until the scene is ready, so the intro animation IS the reveal
              instead of running underneath the loading screen or over unloaded geometry. */}
          {sceneReady && <IntroCamera key={introKey} onComplete={() => {
            setIntroDone(true)
            playAmbientSound()
            }} />}


          {introDone && <CameraCollisionGuard targetRef={modelRef} />}

          {introDone && mode === 'walk' && <WalkControls />}
          {introDone && mode === 'orbit' && <CustomOrbitControls />}


          {import.meta.env.DEV && <CameraDebugPanel onReplay={handleReplay} />}
          {import.meta.env.DEV && <Stats />}
        </Canvas>
      </ErrorBoundary>

      <LoadingScreen show={!sceneReady} />

      {introDone && (
        <ControlModeToggle mode={mode} onChange={setMode} />
      )}
      {introDone && (
        <InfoPanel />
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