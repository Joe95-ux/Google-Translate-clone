import { create } from "zustand";

export const useShareModal = create((set) => ({
  isOpen: false,
  onOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  onClose: () => set({ isOpen: false}),
}));
