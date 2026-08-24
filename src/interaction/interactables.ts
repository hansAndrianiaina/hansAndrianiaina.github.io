// // src/interaction/interactables.ts
// export interface InteractableConfig {
//   title: string
//   description: string
// }

// // Keys must match the mesh's `name` — check Model.tsx's nodes.<Name> keys
// // (these come directly from the Blender object names at export time).
// export const INTERACTABLES: Record<string, InteractableConfig> = {
//   Cube004: { title: '', description: '' },
//   Cube004_2: { title: '', description: '' },
//   Cube004_4: { title: '', description: '' },
//   Cube004_6: { title: '', description: '' },
//   Cube004_8: { title: '', description: '' },
//   Cube004_10: { title: '', description: '' },
//   Cube004_12: { title: '', description: '' },
//   Cube004_14: { title: '', description: '' },
//   Icosphere_5: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
//   Cylinder_4: { title: 'Flower pot', description: 'An artistic flower pot' },
//   Icosphere_3: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
//   Cylinder_2: { title: 'Flower pot', description: 'An artistic flower pot' },
//   Icosphere_1: { title: 'Levitational support', description: 'A levitational support system for the flower pot' },
//   Cylinder: { title: 'Flower pot', description: 'An artistic flower pot' },
//   Cube002_1: { title: 'Sitting table', description: 'You can sit there' },
//   Cube002_2: { title: 'Sitting table', description: 'You can sit there' },
//   boom_box_1: { title: 'Boom Box', description: 'Play music' },
//   boom_box_2: { title: 'Boom Box', description: 'Play music' },
//   Cube005_1: { title: 'DOSSIER-H', description: 'A comprehensive overview of Hanssi\'s professional journey — academic background, key roles held, technical expertise, and the mission-driven work that has shaped their career to date.' },
//   Cube: { title: 'Door', description: 'This door is currently locked' },
//   Cube002: { title: 'Door', description: 'This door is currently locked' },
//   Sphere: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
//   Sphere_1: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
//   Sphere_2: { title: 'Robutler', description: 'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.' },
// }

// src/data/interactables.ts

import interactablesData from '../data/interactables.json'

// --- Shared shape, mirrors AnimationInfoPanel's section props exactly ---
interface InfoSection {
  heading: string
  content?: string
  items?: string[]
}

interface InteractablePanelData {
  /** One-line hook / tagline. Falls back to `description` if omitted. */
  hook?: string

  description?: InfoSection
  /** "What it is" — name the heading yourself, e.g. "Mission Brief". */
  overview?: InfoSection
  /** "How it works" — name the heading yourself, e.g. "Under the Hood". */
  howItWorks?: InfoSection
  techStack?: string[]
  techStackHeading?: string
  demoUrl?: string
  demoLabel?: string
}

export interface InteractableConfig {
  /** Short label — used as a tooltip title AND as the panel title if `panel` is set. */
  title: string
  /**
   * Optional. Only set this for objects that should open the FULL info panel
   * (sections, tech stack, demo link) instead of a plain title/description tooltip.
   */
  panel?: InteractablePanelData
}

export const INTERACTABLES: Record<string, InteractableConfig> = interactablesData as Record<string, InteractableConfig>

/**
 * Maps an InteractableConfig straight onto AnimationInfoPanel props.
 * Simple objects (no `panel`) just render title + hook (from description) —
 * every richer section is omitted automatically since the fields are undefined.
 */
export function toPanelProps(config: InteractableConfig) {
  return {
    title: config.title,
    description: config.panel?.description,
    hook: config.panel?.hook,
    overview: config.panel?.overview,
    howItWorks: config.panel?.howItWorks,
    techStack: config.panel?.techStack,
    techStackHeading: config.panel?.techStackHeading,
    demoUrl: config.panel?.demoUrl,
    demoLabel: config.panel?.demoLabel,
  }
}