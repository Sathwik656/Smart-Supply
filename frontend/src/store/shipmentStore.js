import { create } from 'zustand'

export const useShipmentStore = create((set) => ({
  selectedShipmentId: null,
  setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
}))
