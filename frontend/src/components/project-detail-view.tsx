import { useTasks, useUpdateTask, useProjects } from "@/hooks/useTasks"
import { useAppStore } from "@/stores/useAppStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { EditTaskModal } from "./edit-task-modal"

export function ProjectDetailView() {
    const projectId = useAppStore(state => state.selectedProjectId)
    const setCurrentView = useAppStore(state => state.setCurrentView)
    const setTaskModalOpen = useAppStore(state => state.setTaskModalOpen)

    const { data: projects } = useProjects(true)
    const { data: tasks, isLoading } = useTasks(true, true, projectId || undefined)
    const { mutate: updateTask } = useUpdateTask()

    const [taskToEdit, setTaskToEdit] = useState<any>(null)

    const project = projects?.find((p: any) => p.id === projectId)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Syncing with Task Matrix...</p>
            </div>
        )
    }

    if (!projectId || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-muted-foreground font-medium">No project selected.</p>
                <Button onClick={() => setCurrentView('projects')}>Return to Matrix</Button>
            </div>
        )
    }

    const rootTasks = tasks?.filter((t: any) => !t.parent_id) || []

    // Helper to render a task and its subtasks
    const renderTask = (task: any, columnLabel: string) => {
        const subtasks = tasks?.filter((t: any) => t.parent_id === task.id) || []
        const setSelectedParentTaskId = useAppStore.getState().setSelectedParentTaskId
        const setTaskModalOpen = useAppStore.getState().setTaskModalOpen

        return (
            <Card key={task.id} className="group relative overflow-hidden border-border/60 hover:border-primary/40 transition-all shadow-sm">
                <div className={`absolute top-0 left-0 w-1 h-full ${columnLabel === 'In Progress' ? 'bg-primary' : columnLabel === 'Blocked' ? 'bg-destructive' : columnLabel === 'Completed' ? 'bg-emerald-500' : 'bg-muted'}`} />
                <CardHeader className="p-3 pb-1">
                    <CardTitle className={`text-xs font-bold leading-tight ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1 space-y-2">
                    {task.description && <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>}

                    {subtasks.length > 0 && (
                        <div className="mt-2 pl-2 border-l border-border/60 space-y-1">
                            {subtasks.map((st: any) => (
                                <div key={st.id} className="flex items-center gap-2">
                                    <div className={`h-1 w-1 rounded-full ${st.status === 'done' ? 'bg-emerald-500' : 'bg-primary/40'}`} />
                                    <span className={`text-[9px] font-medium truncate ${st.status === 'done' ? 'line-through opacity-40' : ''}`}>{st.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1">
                            {task.is_deep_work && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Deep Work" />}
                            <span className="text-[9px] font-black uppercase opacity-60">P{task.priority}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedParentTaskId(task.id); setTaskModalOpen(true) }} className="p-1 hover:bg-primary/10 rounded text-primary" title="Add Subtask">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </button>
                            <button onClick={() => setTaskToEdit(task)} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            </button>
                            {task.status !== 'done' && (
                                <button onClick={() => updateTask({ id: task.id, status: 'done' })} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const todoTasks = rootTasks.filter((t: any) => t.status === 'todo')
    const inProgressTasks = rootTasks.filter((t: any) => t.status === 'in_progress')
    const blockedTasks = rootTasks.filter((t: any) => t.status === 'blocked')
    const doneTasks = rootTasks.filter((t: any) => t.status === 'done')

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
            <EditTaskModal
                task={taskToEdit}
                open={!!taskToEdit}
                onOpenChange={(open) => !open && setTaskToEdit(null)}
            />

            <div className="flex items-start justify-between border-b pb-6">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView('projects')} className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6" /></svg>
                        Back to Matrix
                    </Button>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{project.name}</h1>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">{project.description}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setTaskModalOpen(true)} className="font-bold shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Add Task Node
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { label: 'Todo', tasks: todoTasks, color: 'bg-secondary', text: 'text-muted-foreground' },
                    { label: 'In Progress', tasks: inProgressTasks, color: 'bg-primary/20', text: 'text-primary' },
                    { label: 'Blocked', tasks: blockedTasks, color: 'bg-destructive/10', text: 'text-destructive' },
                    { label: 'Completed', tasks: doneTasks, color: 'bg-emerald-500/10', text: 'text-emerald-500' }
                ].map((column) => (
                    <div key={column.label} className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className={`text-xs font-black uppercase tracking-widest ${column.text}`}>{column.label}</h3>
                            <span className="text-xs font-bold bg-secondary/50 px-2 py-0.5 rounded-full">{column.tasks.length}</span>
                        </div>
                        <div className="space-y-3">
                            {column.tasks.length === 0 && (
                                <div className="h-16 border-2 border-dashed rounded-xl flex items-center justify-center opacity-30 text-[10px] font-bold uppercase">Empty Unit</div>
                            )}
                            {column.tasks.map((task: any) => renderTask(task, column.label))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
