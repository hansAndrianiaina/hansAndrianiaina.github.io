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

export const INTERACTABLES: Record<string, InteractableConfig> = {
  Cube004: { title: ''},
  Cube004_2: { title: ''},
  Cube004_4: { title: ''},
  Cube004_6: { title: ''},
  Cube004_8: { title: ''},
  Cube004_10: { title: ''},
  Cube004_12: { title: ''},
  Cube004_14: { title: ''},

  Icosphere_5: { title: 'Levitational support', panel: { description: { heading: 'Description', content: 'A levitational support system for the flower pot' } } },
  Cylinder_4: { title: 'Flower pot', panel: { description: { heading: 'Description', content: 'An artistic flower pot' } } },
  Icosphere_3: { title: 'Levitational support', panel: { description: { heading: 'Description', content: 'A levitational support system for the flower pot' } } },
  Cylinder_2: { title: 'Flower pot', panel: { description: { heading: 'Description', content: 'An artistic flower pot' } } },
  Icosphere_1: { title: 'Levitational support', panel: { description: { heading: 'Description', content: 'A levitational support system for the flower pot' } } },
  Cylinder: { title: 'Flower pot', panel: { description: { heading: 'Description', content: 'An artistic flower pot' } } },

  Cube002_1: { title: 'Sitting table', panel: { description: { heading: 'Description', content: 'You can sit there' } } },
  Cube002_2: { title: 'Sitting table', panel: { description: { heading: 'Description', content: 'You can sit there' } } },

  boom_box_1: { title: 'Boom Box', panel: { description: { heading: 'Description', content: 'Play music' } } },
  boom_box_2: { title: 'Boom Box', panel: { description: { heading: 'Description', content: 'Play music' } } },

  // Example of a rich, full-panel interactable — every `panel` field is optional,
  // so trim whatever you don't need and the corresponding section just won't render.
  Cube005_1: {
    title: 'DOSSIER-H',

    panel: {
      hook: 'Data product engineer & 3D artist',
      description: {
        heading: 'Description',
        content:
          "A comprehensive overview of Hanssi's professional journey — academic background, key roles held, technical expertise, and the mission-driven work that has shaped their career to date.",
      },      
      overview: {
        heading: 'Content',
        content:
          "Academic background, key roles, and the mission-driven work that has shaped Hanssi's career so far.",
      },
      howItWorks: {
        heading: 'Field Notes',
        items: [
          'Data product engineering — pipelines, tooling, product thinking',
          '3D art & real-time interactive scenes',
          'This portfolio itself is one of the case studies',
        ],
      },
      techStack: ['React', 'TypeScript', 'Three.js', 'Blender', 'Python'],
      demoUrl: 'https://www.linkedin.com/in/hanssi-andrianiaina-rasolomanana-047183205/',
      demoLabel: 'Open Résumé ↗',
    },
  },

  Cube: { title: 'Door', panel: { description: { heading: 'Description', content: 'This door is currently locked' } } },
  Cube002: { title: 'Door', panel: { description: { heading: 'Description', content: 'This door is currently locked' } } },

  Sphere: {
    title: 'Robutler',
    panel: {
      description: {
        heading: 'Description',
        content:
          'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.',
      },
    },
  },
  Sphere_1: {
    title: 'Robutler',
    panel: {
      description: {
        heading: 'Description',
        content:
          'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.',
      },
    },
  },
  Sphere_2: {
    title: 'Robutler',
    panel: {
      description: {
        heading: 'Description',
        content:
          'A robotic assistant acting as a butler. Program is currently under implementation. You will be able to talk to it soon.',
      },
    },
  },
}

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