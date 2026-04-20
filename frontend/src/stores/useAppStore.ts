import { create } from 'zustand'

interface AppState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    commandBarOpen: boolean;
    setCommandBarOpen: (open: boolean) => void;
    taskModalOpen: boolean;
    setTaskModalOpen: (open: boolean) => void;
    projectModalOpen: boolean;
    setProjectModalOpen: (open: boolean) => void;
    plannerModalOpen: boolean;
    setPlannerModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    commandBarOpen: false,
    setCommandBarOpen: (open) => set({ commandBarOpen: open }),
    taskModalOpen: false,
    setTaskModalOpen: (open) => set({ taskModalOpen: open }),
    projectModalOpen: false,
    setProjectModalOpen: (open) => set({ projectModalOpen: open }),
    plannerModalOpen: false,
    setPlannerModalOpen: (open) => set({ plannerModalOpen: open })
}))
