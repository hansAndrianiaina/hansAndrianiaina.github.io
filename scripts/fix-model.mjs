import fs from 'node:fs'

const file = 'src/components/Model.tsx'
let src = fs.readFileSync(file, 'utf8')

// 1. type-only import (known gltfjsx + Vite bug) and unused React import
src = src.replace("import { GLTF } from 'three-stdlib'", "import type { GLTF } from 'three-stdlib'")
src = src.replace("import React from 'react'\n", '')

// 2. missing GLTFAction type
if (!src.includes('type GLTFAction')) {
  src = src.replace('type GLTFResult', 'type GLTFAction = THREE.AnimationClip\n\ntype GLTFResult')
}

// 3. base-path-safe model path
src = src.replace(/'\/scene\.glb'/g, 'MODEL_PATH')
if (!src.includes('const MODEL_PATH')) {
  src = src.replace(
    'export function Model',
    "const MODEL_PATH = import.meta.env.BASE_URL + 'models/scene.glb'\n\nexport function Model",
  )
}

// 4. dedupe repeated lines inside the `nodes: { ... }` type
src = src.replace(/(nodes: \{\n)([\s\S]*?)(\n  \})/, (_, open, body, close) => {
  const seen = new Set()
  const unique = body.split('\n').filter((line) => {
    const key = line.trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return open + unique.join('\n') + close
})

// 5. double cast: drei's useGLTF return type doesn't overlap enough with GLTFResult
src = src.replace(
  /useGLTF\((MODEL_PATH|'[^']*')\)\s+as GLTFResult/,
  'useGLTF($1) as unknown as GLTFResult',
)

fs.writeFileSync(file, src)
console.log('Model.tsx patched')