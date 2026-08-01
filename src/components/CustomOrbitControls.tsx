import { OrbitControls } from '@react-three/drei'

export default function CustomOrbitControls() {
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

            // Feel
            enableDamping
            dampingFactor={0.05}
          />
}