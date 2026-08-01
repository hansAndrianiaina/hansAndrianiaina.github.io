# Hans Andrianiaina Portfolio

A 3D interactive portfolio website built with React Three Fiber, featuring a walkable 3D environment with interactive objects, dual camera modes, and animated UI panels.

## Tech Stack

- **React 19.2.7** + **TypeScript 6.0.2** (strict mode)
- **Vite 8.1.1** as build tool
- **React Three Fiber 9.6.1** (@react-three/fiber) for 3D rendering
- **@react-three/drei 10.7.7** for helpers (OrbitControls, Environment, Stats, Bounds, Center, Leva)
- **Leva 0.10.1** for debug UI panels
- **Three.js 0.185.1** as peer dependency
- **oxlint** for linting
- **gh-pages** for GitHub Pages deployment

## Project Structure

```
hansAndrianiaina.github.io/
├── public/
│   ├── models/
│   │   └── scene.glb           # 3D scene model (rooms, furniture, interactive objects)
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.tsx                # Entry point - React 18 createRoot
│   ├── App.tsx                 # Root component - renders Scene
│   ├── index.css               # Global CSS reset + full-screen setup
│   ├── App.css                 # Legacy styles (mostly unused)
│   ├── components/
│   │   ├── Scene.tsx           # Main 3D scene orchestrator
│   │   ├── Model.tsx           # Auto-generated GLTF component (gltfjsx)
│   │   ├── InteractiveModel.tsx # Wrapper adding hover/click interactions
│   │   ├── WalkControls.tsx    # First-person WASD + mouse look controls
│   │   ├── IntroCamera.tsx     # Animated camera entrance (5s ease-in)
│   │   ├── IntroCameraControls.tsx # Leva debug controls for intro camera
│   │   ├── CameraCollisionGuard.tsx # Raycast-based camera collision
│   │   ├── ControlModeToggle.tsx  # UI toggle: Orbit ↔ Walk
│   │   ├── CameraDebugPanel.tsx   # Leva panel showing camera position
│   │   ├── InfoPanel.tsx       # Personal info panel (minimizable, glassmorphism)
│   │   ├── AnimationInfoPanel.tsx # Centered panel for selected object info
│   ├── hooks/
│   │   └── useCameraCollision.ts   # Reusable camera collision hook
│   ├── interaction/
│   │   ├── interactables.ts    # Mesh name → {title, description} mapping
│   │   └── DragGuardContext.tsx # Distinguishes clicks from drags
│   └── assets/                 # Static assets (empty)
├── package.json
├── tsconfig.json               # Project references only
├── tsconfig.app.json           # App TS config (strict, bundler mode)
├── tsconfig.node.json          # Node TS config (for vite.config.ts)
├── vite.config.ts              # Vite config with base path for GH Pages
├── index.html                  # HTML entry point
└── CLAUDE.md                   # Project guidelines
```

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/hansAndrianiaina/hansAndrianiaina.github.io.git
cd hansAndrianiaina.github.io

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open http://localhost:5173 - you'll see a 3D room environment with an animated camera intro. After the intro completes:
- **Walk mode** (default): WASD to move, drag to look around
- **Orbit mode**: Click toggle in bottom-right, then orbit/pan/zoom with mouse
- Click interactive objects (highlighted on hover) to see info panels
- Bottom-left panel shows contact info (click to expand)
- Dev tools: Leva panel (top-right), Camera position (Leva), Stats (bottom)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build locally |

## How It Works

### 1. Entry & Rendering (`main.tsx` → `App.tsx` → `Scene.tsx`)

- `main.tsx`: Standard React 19 `createRoot` entry point, renders `<App />`
- `App.tsx`: Minimal wrapper rendering `<Scene />` inside a full-screen `.app` container
- `Scene.tsx`: The main orchestrator - sets up the R3F `<Canvas>` and all 3D systems

### 2. 3D Scene (`Scene.tsx`)

The `<Canvas>` is configured with:
- **Camera**: Initial position `[0, 1, 4]`, FOV 45°
- **Background**: Light gray (`#abbbb8`)
- **Fog**: Same color as background, near 10, far 20
- **Suspense**: Wraps scene content with `fallback={null}`

**Scene Composition:**
```
<Canvas>
  <color attach="background" />
  <fog attach="fog" />
  <Suspense>
    <Ground plane />           {/* 50x50 gray plane at y=-1.1 */}
    <DragGuardProvider>        {/* Context for click vs drag detection */}
      <Bounds fit clip margin={1.2}>  {/* Auto-fit camera to model bounds, clip to prevent escaping */}
        <Center>               {/* Centers model at origin */}
          <InteractiveModel /> {/* Wrapper adding hover/click to Model */}
        </Center>
      </Bounds>
    </DragGuardProvider>
    <Environment preset="city" />  {/* HDRI lighting from drei */}
  </Suspense>
  <IntroCamera />              {/* 5s animated camera entrance */}
  <CameraCollisionGuard />     {/* Prevents camera passing through walls */}
  {introDone && mode === 'walk' && <WalkControls />}
  {introDone && mode === 'orbit' && <OrbitControls />}
  {dev && <CameraDebugPanel />}
  {dev && <Stats />}
</Canvas>
```

**Post-Intro UI (rendered outside Canvas):**
- `<ControlModeToggle />` - Orbit/Walk segmented control (bottom-right)
- `<InfoPanel />` - Personal info panel (bottom-left)
- `<AnimationInfoPanel />` - Centered info for clicked objects

### 3. Model Loading (`Model.tsx` → `InteractiveModel.tsx`)

**Model.tsx** - Auto-generated via gltfjsx:
```bash
npx gltfjsx@6.5.3 public/models/scene.glb --types --keepnames -o src/components/Model.tsx
```
- Loads `public/models/scene.glb` via `useGLTF` from drei
- Exports typed `nodes` and `materials` matching Blender object names
- Composes the scene hierarchically: rooms, furniture, screens, buttons, plants, lamps
- `useGLTF.preload(MODEL_PATH)` starts loading early

**InteractiveModel.tsx** - Adds interactivity:
- Clones materials for interactive meshes only (prevents hover bleeding to shared materials)
- Stores original emissive colors for restoration
- **Hover**: Sets emissive to white (intensity 0.35), changes cursor to pointer
- **Click**: Calls `onSelect(meshName)` unless a drag occurred (via `DragGuardContext`)
- **Pointer events**: `onPointerOver`, `onPointerOut`, `onClick` on the wrapper `<group>`

### 4. Interaction System (`interaction/`)

**interactables.ts** - Configuration mapping mesh names to display info:
```typescript
export const INTERACTABLES: Record<string, InteractableConfig> = {
  Cube004: { title: 'Project Panel', description: '...' },
  Cube002: { title: 'Sitting table', description: 'You can sit there' },
  boom_box_1: { title: 'Boom Box', description: 'Play music' },
  // ... etc
}
```
- Keys **must match** mesh `name` props in `Model.tsx` (from Blender export)
- Used by `InteractiveModel` for hover detection and `AnimationInfoPanel` for display

**DragGuardContext.tsx** - Prevents click-after-drag:
- Tracks pointer distance from `pointerdown` to `pointerup`
- If movement > 12px (`DRAG_THRESHOLD`), sets `didDragRef.current = true`
- `InteractiveModel` checks this ref in click handler to swallow drag-end clicks
- Provided via `DragGuardProvider` wrapping the model in `Scene.tsx`

### 5. Camera Controls

#### WalkControls (`WalkControls.tsx`) - First-person mode (default)
- **Movement**: WASD / Arrow keys, damped acceleration (6 Hz)
- **Look**: Mouse drag (pointerdown + move), damped rotation (8 Hz)
- **Constraints**: Pitch clamped to ±(π/2 - 0.05), yaw unbounded
- **Velocity**: Applied in camera local space, Y zeroed (no flying)
- **Frame-rate independent**: Uses `1 - Math.exp(-damping * delta)` smoothing

#### OrbitControls (from drei) - Orbit mode
- Configured in `Scene.tsx` with limits:
  - `minPolarAngle: Math.PI / 2.8` (can't look straight down)
  - `maxPolarAngle: Math.PI / 1.5` (can't look straight up)
  - `minDistance: 0.1`, `maxDistance: 4`
  - `enablePan: false`, `enableZoom: true`, `enableRotate: true`
  - `enableDamping`, `dampingFactor: 0.05`

#### ControlModeToggle (`ControlModeToggle.tsx`)
- Segmented control with animated sliding pill
- Glassmorphism styling matching other panels
- Toggles `mode` state in `Scene.tsx` ('walk' | 'orbit')

### 6. Camera Collision (`CameraCollisionGuard.tsx` + `useCameraCollision.ts`)

**Mechanism**: Raycast from scene origin (0,0,0) toward camera position
- If ray hits collision mesh before reaching camera, clamp camera to `hit.distance - margin`
- Runs every frame via `useFrame`
- `margin: 0.3` prevents z-fighting at wall surface
- Collision mesh: the model group (via `modelRef` from `Bounds`)

### 7. Intro Camera Animation (`IntroCamera.tsx` + `IntroCameraControls.tsx`)

- **Start**: `[-2.2, 3.2, 9.2]` (configurable via Leva)
- **End**: `[0, 0.1, 1.9]` (configurable via Leva)
- **Duration**: 5s (configurable via Leva)
- **Easing**: `1 - (1 - t)³` (cubic ease-out)
- Camera lerps position, always `lookAt(0, 0, 0)`
- Calls `onComplete` callback when done → enables controls + shows UI

**IntroCameraControls.tsx**: Leva debug panel (dev only) for tweaking start/end/duration live

### 8. UI Panels

#### InfoPanel (`InfoPanel.tsx`) - Bottom-left personal panel
- **Minimizable**: Click chevron button to expand/collapse (animated width/opacity)
- **Glassmorphism**: Multi-layer gradient background, backdrop blur, drop shadow
- **Chamfered corners**: CSS `clip-path` polygon (asymmetric cuts)
- **Content**: Name, title, 3 links (Email, GitHub, LinkedIn) with hover effects
- **SVG frame**: Decorative HUD-style border with accent lines and ticks

#### AnimationInfoPanel (`AnimationInfoPanel.tsx`) - Centered object info
- Appears when clicking an interactive object (via `selected` state in Scene)
- Slide-up + fade-in animation (0.6s ease)
- Same glassmorphism + chamfered style as InfoPanel
- Shows `title` (uppercase) and `subtitle` (monospace) from `INTERACTABLES`
- Close button (via `onClose` callback) clears selection

#### CameraDebugPanel (`CameraDebugPanel.tsx`) - Dev only
- Leva `monitor` showing live camera position (x, y, z) updated via `useFrame` ref
- "Copy to clipboard" button for position debugging

### 9. Styling Approach

- **index.css**: CSS reset + `html, body, #root { width: 100%; height: 100% }`
- **App.css**: Legacy Vite template styles (mostly unused)
- **Components**: Inline `style` objects with `CSSProperties` type
- **Shared visual language**: Glassmorphism (blur + semi-transparent gradients), chamfered corners via `clip-path`, cyan/teal accent color (`#eafcff`, `rgba(190,240,245,...)`)
- **No external CSS framework** - all custom inline styles

## Development Features

### Leva Debug Panels (dev only, hidden in production)
- **Intro Camera**: Tweak start/end position and duration live
- **Camera Position**: Live monitor + copy button
- **Global Leva**: Collapsed by default, toggle with `L` key

### Stats Panel (dev only)
- Shows FPS, frame time, draw calls, triangles, etc. (from drei)

### Hot Module Replacement
- Vite HMR for React components
- Three.js objects preserve state on edit (R3F reconciler)

## Deployment

### GitHub Pages
- `vite.config.ts` sets `base: '/hansAndrianiaina.github.io/'`
- `gh-pages` in devDependencies for `npm run deploy` (if configured)
- Model loads via `import.meta.env.BASE_URL + 'models/scene.glb'` - works on subpath

### Build Output
- `npm run build` → `dist/` folder
- TypeScript compiles with `noEmit: true` (type-check only), Vite handles bundling
- Assets hashed for cache busting

## Model Pipeline

### Updating the 3D Model
1. Edit `public/models/scene.glb` in Blender (or replace file)
2. Re-generate `Model.tsx`:
   ```bash
   npx gltfjsx@6.5.3 public/models/scene.glb --types --keepnames -o src/components/Model.tsx
   ```
3. Update `interactables.ts` if mesh names changed (keys must match)
4. Adjust camera collision bounds if room layout changed significantly

### Mesh Naming Convention
- Blender object names become mesh `name` props in `Model.tsx`
- These names are the keys in `INTERACTABLES` for interactivity
- Use descriptive names in Blender (e.g., `ProjectPanel`, `BoomBox`, `NextButton`)

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Inline styles over CSS modules | Colocated with component logic, dynamic values easy, no build step for styles |
| `DragGuardContext` separate from `InteractiveModel` | Reusable for any clickable 3D object, clean separation of concerns |
| `useCameraCollision` as hook | Reusable, testable, separates collision logic from component lifecycle |
| `Bounds fit clip` from drei | Auto-fits camera to model on load, `clip` prevents camera escaping |
| Two control modes | Walk for immersion, Orbit for overview - different use cases |
| Intro animation before controls | Cinematic entrance, prevents user fighting camera during transition |
| Leva for debug only | Zero production overhead, `hidden={!import.meta.env.DEV}` |

## Requirements

- **Node**: v20+ (tested on v24.18.0)
- **npm**: 10+ (tested on 11.16.0)
- Modern browser with WebGL2 support

## License

MIT - Personal portfolio project