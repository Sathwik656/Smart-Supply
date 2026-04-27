import { create } from 'zustand'

export const useMapStore = create((set) => ({
  viewport: {
    latitude: 20.5937, // Center of India
    longitude: 78.9629,
    zoom: 4,
    bearing: 0,
    pitch: 0,
  },
  setViewport: (viewport) => set({ viewport }),
  
  showWeatherLayer: false,
  toggleWeatherLayer: () => set((state) => ({ showWeatherLayer: !state.showWeatherLayer })),
}))
