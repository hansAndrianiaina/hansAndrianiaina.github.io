#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------
# Scaffolds a React Three Fiber + TypeScript + Vite portfolio,
# ready to deploy to GitHub Pages as a project page.
#
# Usage:
#   ./setup-r3f-portfolio.sh <repo-name>
#
# <repo-name> MUST match the GitHub repo you'll push to, since it's
# used as the Vite "base" path (required for project pages, e.g.
# https://username.github.io/repo-name/).
# ------------------------------------------------------------------

REPO_NAME="${1:-my-3d-portfolio}"

echo "Scaffolding React Three Fiber portfolio: $REPO_NAME"
echo ""

# npm create vite@latest "$REPO_NAME" -- --template react-ts
# cd "$REPO_NAME"

# echo ""
# echo "Installing dependencies..."
# npm install three @react-three/fiber @react-three/drei
# npm install -D @types/three gh-pages

mkdir -p public/models
mkdir -p src/components
# mkdir -p .github/workflows

# ---------------------------------------------------------------
# vite.config.ts — base path matches repo name for GitHub Pages
# ---------------------------------------------------------------
cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/$REPO_NAME/',
  plugins: [react()],
})
EOF

# ---------------------------------------------------------------
# Scene.tsx — placeholder cube until you drop in your real model
# ---------------------------------------------------------------
cat > src/components/Scene.tsx << 'EOF'
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
EOF

# ---------------------------------------------------------------
# InfoPanel.tsx — simple HTML overlay, not part of the 3D scene
# ---------------------------------------------------------------
cat > src/components/InfoPanel.tsx << 'EOF'
export default function InfoPanel() {
  return (
    <div className="info-panel">
      <h1>Your Name</h1>
      <p>3D Artist / Developer</p>
      <div className="links">
        <a href="mailto:you@example.com">Email</a>
        <a href="https://github.com/yourusername" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </div>
  )
}
EOF

# ---------------------------------------------------------------
# App.tsx
# ---------------------------------------------------------------
cat > src/App.tsx << 'EOF'
import Scene from './components/Scene'
import InfoPanel from './components/InfoPanel'
import './index.css'

export default function App() {
  return (
    <div className="app">
      <Scene />
      <InfoPanel />
    </div>
  )
}
EOF

# ---------------------------------------------------------------
# index.css
# ---------------------------------------------------------------
cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

.app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #111;
}

.info-panel {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  color: white;
  font-family: sans-serif;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.info-panel .links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  pointer-events: auto;
}

.info-panel a {
  color: white;
  text-decoration: underline;
}
EOF

# # ---------------------------------------------------------------
# # GitHub Actions — auto build + deploy to gh-pages branch on push
# # ---------------------------------------------------------------
# cat > .github/workflows/deploy.yml << 'EOF'
# name: Deploy

# on:
#   push:
#     branches: [main]

# jobs:
#   build-deploy:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4

#       - uses: actions/setup-node@v4
#         with:
#           node-version: 20

#       - run: npm ci
#       - run: npm run build

#       - uses: peaceiris/actions-gh-pages@v3
#         with:
#           github_token: ${{ secrets.GITHUB_TOKEN }}
#           publish_dir: ./dist
# EOF

# git init -b main
# git add -A
# git commit -m "Initial scaffold: R3F + TS + Vite portfolio"

echo ""
echo "----------------------------------------------------------"
echo "Done. Project created in ./$REPO_NAME"
echo ""
echo "Next steps:"
echo "  1. cd $REPO_NAME"
echo "  2. Export your Blender model as model.glb -> public/models/"
echo "  3. npx gltfjsx public/models/model.glb --types -o src/components/Model.tsx"
echo "  4. In Scene.tsx, swap the placeholder <mesh> for <Model />"
echo "  5. npm run dev"
echo "  6. Create the repo '$REPO_NAME' on GitHub, then:"
echo "       git remote add origin git@github.com:<yourusername>/$REPO_NAME.git"
echo "       git push -u origin main"
echo "  7. In GitHub repo Settings > Pages, set source to the 'gh-pages' branch"
echo "----------------------------------------------------------"