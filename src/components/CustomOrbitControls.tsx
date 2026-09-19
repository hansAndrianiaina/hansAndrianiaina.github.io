import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'

// One finger orbits; two fingers pinch-zoom AND twist-rotate at the same time.
// (Pan is disabled below, so DOLLY_ROTATE is what you want here rather than DOLLY_PAN.)
// Module-level constant so the object identity is stable across renders.
const TOUCHES = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }

export default function CustomOrbitControls({ touch = false }: { touch?: boolean }) {
 return  <OrbitControls  
            makeDefault
            // enabled={introDone}

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

            // Touch gestures (OrbitControls also sets `touch-action: none` on the canvas itself)
            touches={TOUCHES}
            rotateSpeed={touch ? 0.7 : 1}   // a full-width swipe is a big arc on a small screen
            zoomSpeed={touch ? 0.8 : 1}

            // Feel
            enableDamping
            dampingFactor={0.05}
          />
}