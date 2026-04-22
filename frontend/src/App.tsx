import { useAppStore } from './stores/useAppStore'
import { CommandBar } from './components/command-bar'
import { DailyFocus } from './components/daily-focus'
import { PrinciplesView } from './components/principles-view'
import { PersonasView } from './components/personas-view'
import { WeeklyHorizonView } from './components/weekly-horizon'
import { MidTermHorizonView } from './components/mid-term-horizon'
import { RoadmapView } from './components/roadmap-view'
import { SettingsView } from './components/settings-view'
import { CreateTaskModal } from './components/create-task-modal'
import { CreateProjectModal } from './components/create-project-modal'
import { ExecutionPlannerModal } from './components/execution-planner-modal'
import { ProjectsView } from './components/projects-view'
import { KnowledgeBaseView } from './components/knowledge-base-view'
import { ProjectDetailView } from './components/project-detail-view'
import { StrategicChatView } from './components/chat-view'
import { useTasks } from './hooks/useTasks'
import { LoginView } from './components/login-view'
import { StrategicJournalView } from './components/strategic-journal-view'

function App() {
  const currentView = useAppStore(state => state.currentView)
  const setCurrentView = useAppStore(state => state.setCurrentView)
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen)
  const setCommandBarOpen = useAppStore(state => state.setCommandBarOpen)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)
  const logout = useAppStore(state => state.logout)
  const { data: tasks, isLoading } = useTasks(isAuthenticated)

  if (!isAuthenticated) return <LoginView />

  // Dynamic Analytical Computations via Frontend logic
  const activeCount = tasks?.filter((t: any) => t.status === 'todo' || t.status === 'in_progress').length || 0;
  const blockedCount = tasks?.filter((t: any) => t.status === 'blocked').length || 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <CommandBar />

      {/* Root Interaction Modals managed concurrently */}
      <CreateTaskModal
        open={useAppStore(state => state.taskModalOpen)}
        onOpenChange={(open) => useAppStore.getState().setTaskModalOpen(open)}
      />
      <CreateProjectModal
        open={useAppStore(state => state.projectModalOpen)}
        onOpenChange={(open) => useAppStore.getState().setProjectModalOpen(open)}
      />
      <ExecutionPlannerModal
        open={useAppStore(state => state.plannerModalOpen)}
        onOpenChange={(open) => useAppStore.getState().setPlannerModalOpen(open)}
      />

      {/* Sidebar Core Component */}
      {isSidebarOpen && (
        <aside className="w-64 border-r border-border bg-card flex flex-col p-4 shrink-0 transition-all duration-300 relative z-20 overflow-y-auto min-h-0">
          <h2 className="text-xl font-bold tracking-tighter mb-8 text-foreground px-2">AI/OS</h2>
          <nav className="space-y-1.5 flex-1">
            <button onClick={() => setCurrentView('daily_focus')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'daily_focus' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Daily Focus</button>
            <button onClick={() => setCurrentView('weekly_horizon')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'weekly_horizon' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Weekly Horizon</button>
            <button onClick={() => setCurrentView('mid_term_horizon')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'mid_term_horizon' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Mid-Term Horizon</button>
            <button onClick={() => setCurrentView('roadmap')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'roadmap' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Global Roadmap</button>
            <button onClick={() => setCurrentView('personas')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'personas' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Teammate Personas</button>
            <button onClick={() => setCurrentView('principles')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'principles' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Guiding Principles</button>
            <button onClick={() => setCurrentView('projects')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'projects' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>Project Matrix</button>
            <button onClick={() => setCurrentView('knowledge_base')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all ${currentView === 'knowledge_base' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>🧠 Knowledge Base</button>
            <button onClick={() => setCurrentView('strategic_chat')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all border-l-2 border-primary/40 ${currentView === 'strategic_chat' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>⚡ Strategic Link</button>
            <button onClick={() => setCurrentView('strategic_journal')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-medium shadow-sm transition-all border-l-2 border-amber-500/40 ${currentView === 'strategic_journal' ? 'bg-amber-500/10 text-amber-500 font-bold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>🎯 Strategic Journal</button>
            <div className="pt-6">
              <button onClick={() => setCurrentView('settings')} className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md font-bold shadow-sm transition-all border ${currentView === 'settings' ? 'bg-primary/10 border-primary/40 text-primary' : 'border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground'}`}>⚙️ OS Configuration</button>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-background relative isolate overflow-hidden">
        <header className="h-14 border-b border-border flex items-center px-4 gap-4 shrink-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 w-full transition-all">
          <button
            onClick={() => useAppStore.getState().toggleSidebar()}
            className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
            title="Toggle Sidebar"
          >
            <svg xmlns="http://www.w3.org/-2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
          </button>

          <div className="flex-1" />

          {/* Spotlight Mock Command Trigger */}
          <div
            onClick={() => setCommandBarOpen(true)}
            className="text-sm text-muted-foreground flex items-center bg-muted/40 px-3 py-1.5 rounded-lg cursor-pointer border border-border hover:bg-muted hover:border-border/80 transition-all shadow-sm group"
          >
            <span className="mr-8 font-medium group-hover:text-foreground transition-colors">Command AI...</span>
            <kbd className="font-mono text-[10px] bg-background px-1.5 py-0.5 rounded text-muted-foreground border shadow-sm font-semibold">CMD+K</kbd>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-all border border-transparent hover:border-destructive/20"
            title="Terminate Session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            <span className="hidden sm:inline">TERMINATE</span>
          </button>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {currentView === 'daily_focus' && (
              <>
                <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">Overview</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 select-none mb-10">
                  <div className="rounded-xl border border-border bg-card h-32 p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Active Tasks</h3>
                    {isLoading ? (
                      <div className="h-8 w-12 mt-2 bg-secondary rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl font-bold mt-2">{activeCount}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-card h-32 p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Blocked By</h3>
                    {isLoading ? (
                      <div className="h-8 w-12 mt-2 bg-secondary rounded animate-pulse" />
                    ) : (
                      <p className="text-3xl font-bold mt-2 text-destructive">{blockedCount}</p>
                    )}
                  </div>
                  <div
                    onClick={() => useAppStore.getState().setPlannerModalOpen(true)}
                    className="rounded-xl border border-amber-500/50 bg-amber-500/5 h-32 p-4 shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer relative overflow-hidden group hover:border-amber-500 transition-colors col-span-2 md:col-span-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                    <h3 className="text-sm font-bold text-amber-500 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Optimize Agenda</h3>
                    <p className="text-muted-foreground text-xs mt-2 leading-relaxed">Let Gemini algorithmically synthesize your optimal Critical Path.</p>
                  </div>
                </div>

                {/* Delegate rendering of task matrices to the primary view component */}
                <DailyFocus />
              </>
            )}

            {currentView === 'principles' && <PrinciplesView />}

            {currentView === 'weekly_horizon' && <WeeklyHorizonView />}

            {currentView === 'mid_term_horizon' && <MidTermHorizonView />}

            {currentView === 'roadmap' && <RoadmapView />}

            {currentView === 'personas' && <PersonasView />}

            {currentView === 'settings' && <SettingsView />}

            {currentView === 'projects' && <ProjectsView />}

            {currentView === 'knowledge_base' && <KnowledgeBaseView />}

            {currentView === 'project_detail' && <ProjectDetailView />}

            {currentView === 'strategic_chat' && <StrategicChatView />}

            {currentView === 'strategic_journal' && <StrategicJournalView />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
