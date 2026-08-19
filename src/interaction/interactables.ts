// src/interaction/interactables.ts
export interface InteractableConfig {
  title: string
  description: string
}

// Keys must match the mesh's `name` — check Model.tsx's nodes.<Name> keys
// (these come directly from the Blender object names at export time).
export const INTERACTABLES: Record<string, InteractableConfig> = {
  Cube004: { title: '', description: '' },
  Cube004_2: { title: '', description: '' },
  Cube004_4: { title: '', description: '' },
  Cube004_6: { title: '', description: '' },
  Cube004_8: { title: '', description: '' },
  Cube004_10: { title: '', description: '' },
  Cube004_12: { title: '', description: '' },
  Cube004_14: { title: '', description: '' },
  Icosphere_5: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
  Cylinder_4: { title: 'Flower pot', description: 'An artistic flower pot' },
  Icosphere_3: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
  Cylinder_2: { title: 'Flower pot', description: 'An artistic flower pot' },
  Icosphere_1: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
  Cylinder: { title: 'Flower pot', description: 'An artistic flower pot' },
  Cube002_1: { title: 'Sitting table', description: 'You can sit there' },
  Cube002_2: { title: 'Sitting table', description: 'You can sit there' },
  boom_box_1: { title: 'Boom Box', description: 'Play music' },
  boom_box_2: { title: 'Boom Box', description: 'Play music' },
  Cube005_1: { title: 'DOSSIER-H', description: 'A comprehensive overview of Hanssi\'s professional journey — academic background, key roles held, technical expertise, and the mission-driven work that has shaped their career to date.' },
  Cube: { title: 'Door', description: 'This door is currently locked' },
  Cube002: { title: 'Door', description: 'This door is currently locked' },
  Sphere: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
  Sphere_1: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
  Sphere_2: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
}