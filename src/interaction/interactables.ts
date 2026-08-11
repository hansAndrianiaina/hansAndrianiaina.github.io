// src/interaction/interactables.ts
export interface InteractableConfig {
  title: string
  description: string
}

// Keys must match the mesh's `name` — check Model.tsx's nodes.<Name> keys
// (these come directly from the Blender object names at export time).
export const INTERACTABLES: Record<string, InteractableConfig> = {
  Cube004: { title: 'Project Panel 1', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_2: { title: 'Project Panel 2', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_4: { title: 'Project Panel 3', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_6: { title: 'Project Panel 4', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_8: { title: 'Project Panel 5', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_10: { title: 'Project Panel 6', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_12: { title: 'Project Panel 7', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube004_14: { title: 'Project Panel 8', description: 'Display project information Display project information Display project information Display project information Display project information Display project informationDisplay project information Display project informationv Display project information Display project informationDisplay project informationDisplay project informationDisplay project information' },
  Cube002: { title: 'Sitting table', description: 'You can sit there' },
  boom_box_1: { title: 'Boom Box', description: 'Play music' },
  boom_box_2: { title: 'Boom Box', description: 'Play music' },
  Cube005_1: { title: 'Main Screen', description: 'Display main content' },
}