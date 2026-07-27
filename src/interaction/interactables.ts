// src/interaction/interactables.ts
export interface InteractableConfig {
  title: string
  description: string
}

// Keys must match the mesh's `name` — check Model.tsx's nodes.<Name> keys
// (these come directly from the Blender object names at export time).
export const INTERACTABLES: Record<string, InteractableConfig> = {
  Cube004: { title: 'Project Panel', description: 'Display project information' },
  Cube002: { title: 'Sitting table', description: 'You can sit there' },
  boom_box_1: { title: 'Boom Box', description: 'Play music' },
  boom_box_2: { title: 'Boom Box', description: 'Play music' },
  Cube005_1: { title: 'Main Screen', description: 'Display main content' },
  Cube004_3: { title: 'Next Button', description: 'Go to the next slide' },
  Cube004_5: { title: 'Previous Button', description: 'Go to the previous slide' },
}