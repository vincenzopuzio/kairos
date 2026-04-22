import { create } from 'zustand'

interface AppState {
    currentView: 'daily_focus' | 'principles' | 'projects' | 'personas' | 'weekly_horizon' | 'mid_term_horizon' | 'roadmap' | 'settings' | 'knowledge_base' | 'project_detail' | 'strategic_chat' | 'strategic_journal';
    setCurrentView: (view: 'daily_focus' | 'principles' | 'projects' | 'personas' | 'weekly_horizon' | 'mid_term_horizon' | 'roadmap' | 'settings' | 'knowledge_base' | 'project_detail' | 'strategic_chat' | 'strategic_journal') => void;
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
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    selectedParentTaskId: string | null;
    setSelectedParentTaskId: (id: string | null) => void;
    isAuthenticated: boolean;
    setAuthenticated: (auth: boolean) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
    currentView: 'daily_focus',
    setCurrentView: (view) => set({ currentView: view }),
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    commandBarOpen: false,
    setCommandBarOpen: (open) => set({ commandBarOpen: open }),
    taskModalOpen: false,
    setTaskModalOpen: (open) => set({ taskModalOpen: open }),
    projectModalOpen: false,
    setProjectModalOpen: (open) => set({ projectModalOpen: open }),
    plannerModalOpen: false,
    setPlannerModalOpen: (open) => set({ plannerModalOpen: open }),
    selectedProjectId: null,
    setSelectedProjectId: (id) => set({ selectedProjectId: id }),
    selectedParentTaskId: null,
    setSelectedParentTaskId: (id) => set({ selectedParentTaskId: id }),
    isAuthenticated: !!localStorage.getItem("token"),
    setAuthenticated: (auth) => set({ isAuthenticated: auth }),
    logout: () => {
        localStorage.removeItem("token");
        window.location.reload();
    }
}))
