import { create } from 'zustand';

interface UIState {
  sidebarExpanded: boolean;
  primebotOpen: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
  togglePrimebot: () => void;
  setPrimebotOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  primebotOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  togglePrimebot: () => set((s) => ({ primebotOpen: !s.primebotOpen })),
  setPrimebotOpen: (v) => set({ primebotOpen: v }),
}));
