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
  id: string
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