import { useState } from "react"
import { useProjects, useDeleteProject } from "@/hooks/useProjects"
import { useAppStore } from "@/stores/useAppStore"
import { useMilestones } from "@/hooks/useMilestones"
import { useProjectDependencies } from "@/hooks/useProjectDependencies"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditProjectModal } from "./edit-project-modal"

import { useTasks } from "@/hooks/useTasks"

function ProjectStats({ projectId }: { projectId: string }) {
    const { data: tasks, isLoading } = useTasks(true, projectId)

    if (isLoading) return <div className="h-6 w-full bg-secondary animate-pulse rounded mt-3" />
    if (!tasks || tasks.length === 0) return null

    const stats = {
        todo: tasks.filter((t: any) => t.status === 'todo').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        blocked: tasks.filter((t: any) => t.status === 'blocked').length,
        done: tasks.filter((t: any) => t.status === 'done').length
    }

    const total = tasks.length

    return (
        <div className="mt-4 pt-3 border-t border-dashed">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Task Matrix Distribution</span>
                <span className="text-[9px] font-black opacity-60">{stats.done}/{total} NODES</span>
            </div>
            <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-secondary shadow-inner">
                {stats.done > 0 && <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(stats.done / total) * 100}%` }} title={`Done: ${stats.done}`} />}
                {stats.in_progress > 0 && <div className="h-full bg-primary transition-all" style={{ width: `${(stats.in_progress / total) * 100}%` }} title={`In Progress: ${stats.in_progress}`} />}
                {stats.blocked > 0 && <div className="h-full bg-destructive transition-all" style={{ width: `${(stats.blocked / total) * 100}%` }} title={`Blocked: ${stats.blocked}`} />}
            </div>
            <div className="flex gap-3 mt-2.5">
                <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <span className="text-[9px] font-bold text-muted-foreground">{stats.todo + stats.in_progress} Pending</span>
                </div>
                {stats.blocked > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        <span className="text-[9px] font-bold text-destructive">{stats.blocked} Critical Block</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function MilestoneProgress({ projectId }: { projectId: string }) {
    const { data: milestones } = useMilestones(projectId)
    const { data: allProjects } = useProjects()
    const { data: dependencies } = useProjectDependencies(projectId)

    if (!milestones || milestones.length === 0) {
        if (!dependencies || dependencies.length === 0) return null
    }

    const done = milestones?.filter((m: any) => m.is_completed).length ?? 0
    const total = milestones?.length ?? 0

    return (
        <div className="space-y-2 mt-2">
            {dependencies && dependencies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {dependencies.map((dep: any) => {
                        const gate = allProjects?.find((p: any) => p.id === dep.depends_on_id);
                        return (
                            <div key={dep.depends_on_id} className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/5 border border-primary/20 rounded text-[9px] font-black text-primary uppercase">
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10" /><path d="m17 7-10 10" /></svg>
                                After: {gate?.name}
                            </div>
                        );
                    })}
                </div>
            )}
            {total > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Milestones</span>
                        <span className="text-[10px] font-bold">{done}/{total}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
                    </div>
                </div>
            )}
        </div>
    )
}

export function ProjectsView() {
    const { data: projects, isLoading } = useProjects()
    const { mutate: deleteProject } = useDeleteProject()
    const [editingProject, setEditingProject] = useState<any>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const setCurrentView = useAppStore(state => state.setCurrentView)
    const setSelectedProjectId = useAppStore(state => state.setSelectedProjectId)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex items-end justify-between border-b pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Project Matrix</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wide">Macro-Entities & External Epics</p>
                </div>
                <Button onClick={() => useAppStore.getState().setProjectModalOpen(true)} className="font-bold shadow-md">
                    Initialize Epic
                </Button>
            </div>

            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && (!projects || projects.length === 0) && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl bg-secondary/5">
                    <h3 className="text-xl font-bold mb-2">No Epics Tracked</h3>
                    <p className="text-muted-foreground mb-4">Initialize your first macro project to bridge into the Mid-Term Horizon.</p>
                </div>
            )}

            {!isLoading && projects && projects.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((p: any) => (
                        <Card key={p.id} className="shadow-sm border-2 border-border/50 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => { setSelectedProjectId(p.id); setCurrentView('project_detail') }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="pb-2 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${p.health_status === 'on_track' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            p.health_status === 'at_risk' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-destructive/10 text-destructive border-destructive/20'
                                            }`}>{p.health_status.replace('_', ' ')}</span>
                                        {p.project_type === 'evergreen' && (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">🌱 Evergreen</span>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => {
                                                useAppStore.getState().setSelectedProjectId(p.id)
                                                useAppStore.getState().setTaskModalOpen(true)
                                            }}
                                            className="p-1 px-2 hover:bg-primary/10 rounded text-primary text-[10px] font-bold flex items-center gap-1 transition-colors border border-primary/20"
                                            title="Quick Add Task"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            TASK
                                        </button>
                                        <button onClick={() => setEditingProject(p)} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                        </button>
                                        <button onClick={() => setConfirmDeleteId(p.id)} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold leading-tight uppercase tracking-tight">{p.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="relative space-y-3">
                                {p.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-secondary/30 p-1.5 rounded-md flex flex-col border shadow-inner">
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-1">Start Date</span>
                                        <span className="text-[11px] font-black">{p.start_date ? new Date(p.start_date).toLocaleDateString() : "TBD"}</span>
                                    </div>
                                    <div className="bg-secondary/30 p-1.5 rounded-md flex flex-col border shadow-inner">
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-1">Deadline</span>
                                        <span className="text-[11px] font-black">{p.external_deadline ? new Date(p.external_deadline).toLocaleDateString() : "Evergreen"}</span>
                                    </div>
                                </div>
                                <MilestoneProgress projectId={p.id} />
                                <ProjectStats projectId={p.id} />

                                {/* Confirm delete inline */}
                                {confirmDeleteId === p.id && (
                                    <div className="mt-2 p-2 rounded-md border border-destructive/40 bg-destructive/5 space-y-2">
                                        <p className="text-xs font-semibold text-destructive">Delete this project and all its milestones?</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="destructive" className="h-7 text-xs flex-1"
                                                onClick={() => { deleteProject(p.id); setConfirmDeleteId(null) }}>
                                                Yes, delete
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                                                onClick={() => setConfirmDeleteId(null)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} />
        </div>
    )
}
