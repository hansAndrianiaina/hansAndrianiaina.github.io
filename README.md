# Hans Andrianiaina Portfolio

## Context
This is a personal portfolio website built with:
- **React 18** + **TypeScript** (strict mode)
- **Vite** as the build tool
- **React Three Fiber** (@react-three/fiber) for 3D rendering
- **@react-three/drei** for helpers (OrbitControls, Environment, Stats)
- **TypeScript** in strict mode

## Project Structure
```
/hansAndrianiaina.github.io/
├── public/
│   └── models/           # 3D assets
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Root component with 3D canvas + info panel
│   ├── App.css           # Styles for app container and info panel
│   ├── index.css         # Global styles (reset + full-screen setup)
│   ├── components/
│   │   ├── Scene.tsx     # React Three Fiber Canvas with 3D scene
│   │   └── InfoPanel.tsx # Personal info panel with links
│   └── assets/           # Static assets
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html            # Web entry point
└── CLAUDE.md             # Project guidelines
```
## Getting Started 

- Clone the repo and install the necessary dependacies : 

```sh
# 1. Clone the repository
git clone https://github.com/hansAndrianiaina/hansAndrianiaina.github.io.git
cd hansAndrianiaina.github.io

# 2. Install dependencies
npm install
```

- Run the app using : 

```sh
# 3. Start development server
npm run dev
```

- Then open http://localhost:5173 - should see a dark screen with an orange rotating cube in the center and an info panel at bottom-left with name and links. Orbit controls should allow orbit/pan/zoom.


### Requirements

- **node**: v24.18.0
- **npm**: 11.16.0
- **React**: 18.3.1
- **React Three Fiber**: 8.16.8
- **@react-three/drei**: 9.111.1
- **@react-three/fiber**: 8.16.8
- **TypeScript**: 5.6.2 (strict mode)
- **Vite**: 5.4.10
- **@vitejs/plugin-react**: 4.3.4


## How It Works

### 1. Entry Point (`main.tsx`)
- Standard React 18 entry point using `createRoot`
- Renders `<App />` into `#root`

### 2. Root Component (`App.tsx`)
- Full-screen container (`.app` with 100vw/100vh)
- Renders two main children:
  - `<Scene />` - The 3D canvas (React Three Fiber)
  - `<InfoPanel />` - Overlay panel with personal info and links (positioned absolute bottom-left)

### 3. 3D Scene (`components/Scene.tsx`)
- Uses `<Canvas>` from `@react-three/fiber` with camera at `[0, 1, 4]`, FOV 45
- `<Suspense fallback={null}>` wraps the scene content
- Current placeholder: A simple orange `<boxGeometry>` with `<meshStandardMaterial>`
- `<Environment preset="city" />` from drei for HDRI lighting
- `<OrbitControls />` for mouse orbit/pan/zoom
- `<Stats />` from drei in dev mode only (shows FPS, etc.)

### 3. Info Panel (`components/InfoPanel.tsx`)
- Absolute positioned overlay at bottom-left
- Displays name: "Hanssi Andrianiaina RASOLOMANANA"
- Title: "3D Artist / Data Product Engineer"
- Links: Email, GitHub, LinkedIn (with `target="_blank" rel="noreferrer"`)
- Pointer-events: none on panel, auto on links

### 5. Styling
- `index.css`: CSS reset + full-screen html/body/#root
- `App.css`: Dark background (#111), info panel styling (white text, text-shadow, pointer-events handling)

