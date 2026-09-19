import { OrbitControls } from '@react-three/drei'

export default function CustomOrbitControls() {
 return  <OrbitControls
            makeDefault

            // Rotation limits (vertical / polar angle, in radians)
            minPolarAngle={Math.PI / 2.8}     // how far up you can orbit (0 = straight down from top)
            maxPolarAngle={Math.PI / 1.5}   // how far down (Math.PI = straight from below)

            // Zoom / distance limits
            minDistance={0.1}                 // closest you can zoom in
            maxDistance={4}                   // furthest you can zoom out

            // Disable whole interaction types
            enablePan={false}                 // no dragging to pan
            enableZoom={true}                 // allow scroll/pinch zoom
            enableRotate={true}               // allow orbit rotation

            // Feel
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={1.0}
            zoomSpeed={1.2}
          />
}