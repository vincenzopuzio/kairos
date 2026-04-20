import { useAppStore } from './stores/useAppStore'
import { CommandBar } from './components/command-bar'
import { DailyFocus } from './components/daily-focus'
import { CreateTaskModal } from './components/create-task-modal'
import { CreateProjectModal } from './components/create-project-modal'
import { ExecutionPlannerModal } from './components/execution-planner-modal'
import { useTasks } from './hooks/useTasks'

function App() {
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen)
  const setCommandBarOpen = useAppStore(state => state.setCommandBarOpen)

  const { data: tasks, isLoading } = useTasks(true)

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
        <aside className="w-64 border-r border-border bg-card flex flex-col p-4 shrink-0 transition-all duration-300 relative z-20">
          <h2 className="text-xl font-bold tracking-tighter mb-8 text-foreground px-2">AI/OS</h2>
          <nav className="space-y-1.5 flex-1">
            <a href="#" className="flex px-3 py-2.5 text-sm rounded-md bg-secondary text-secondary-foreground font-semibold shadow-sm transition-all">Daily Focus</a>
            <a href="#" className="flex px-3 py-2.5 text-sm rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">Project Matrix</a>
            <a href="#" className="flex px-3 py-2.5 text-sm rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">Knowledge Base</a>
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
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
