import { create } from 'zustand'

interface RoomLightingState {
  intensity: number
  enabled: boolean

  setIntensity: (intensity: number) => void
  toggle: () => void
  setEnabled: (enabled: boolean) => void
}

export const useRoomLighting = create<RoomLightingState>((set) => ({
  intensity: 7,
  enabled: true,

  setIntensity: (intensity) =>
    set({
      intensity: Math.max(0, Math.min(10, intensity)),
    }),

  toggle: () =>
    set((state) => ({
      enabled: !state.enabled,
    })),

  setEnabled: (enabled) =>
    set({
      enabled,
    }),
}))