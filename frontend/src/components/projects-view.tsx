import { useState, useMemo } from "react"
import { useProjects, useDeleteProject } from "@/hooks/useTasks"
import { useAppStore } from "@/stores/useAppStore"
import { useProjectDependencies } from "@/hooks/useProjectDependencies"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditProjectModal } from "./edit-project-modal"
import { ProjectAssessmentModal } from "./project-assessment-modal"

function ProjectStats({ stats }: { stats?: any }) {
    if (!stats || stats.total === 0) return null

    const total = stats.total

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

function MilestoneProgress({ projectId, stats }: { projectId: string, stats?: any }) {
    const { data: allProjects } = useProjects(true)
    const { data: dependencies } = useProjectDependencies(projectId)

    if (!stats || stats.total === 0) {
        if (!dependencies || dependencies.length === 0) return null
    }

    const done = stats?.completed ?? 0
    const total = stats?.total ?? 0

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
    const { data: projects, isLoading } = useProjects(true)
    const { mutate: deleteProject } = useDeleteProject()
    const [editingProject, setEditingProject] = useState<any>(null)
    const [assessingProject, setAssessingProject] = useState<any>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const setCurrentView = useAppStore(state => state.setCurrentView)
    const setSelectedProjectId = useAppStore(state => state.setSelectedProjectId)

    const groupedProjects = useMemo(() => {
        return projects?.reduce((acc: any, p: any) => {
            const orgName = p.org?.name || "Direct / Personal"
            if (!acc[orgName]) acc[orgName] = []
            acc[orgName].push(p)
            return acc
        }, {}) || {}
    }, [projects])

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

            {!isLoading && Object.entries(groupedProjects).map(([orgName, orgProjects]: [string, any]) => (
                <div key={orgName} className="space-y-6 pb-8 border-b last:border-0 border-dashed border-border/60">
                    <h2 className="text-2xl font-black flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-lg bg-primary/10 text-primary p-2 rounded-md">🏢</span>
                            {orgName}
                        </div>
                        <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest border border-dashed hover:bg-accent/10 hover:text-accent hover:border-accent">
                            Review Domain Portfolio
                        </Button>
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {orgProjects.map((p: any) => (
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
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-secondary/80 text-secondary-foreground border-border/40">
                                                {p.category === 'company' ? '🏢 Corp' : p.category === 'personal' ? '🏠 Pers' : p.category === 'learning' ? '📚 Edu' : '⚙️ Misc'}
                                            </span>
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
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setAssessingProject(p) }}
                                                className="p-1 hover:bg-accent/10 rounded text-muted-foreground hover:text-accent transition-colors"
                                                title="Record Assessment Moment"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setEditingProject(p) }} className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold leading-tight uppercase tracking-tight">{p.name}</CardTitle>
                                    </div>
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
                                    <MilestoneProgress projectId={p.id} stats={p.milestone_stats} />
                                    <ProjectStats stats={p.task_stats} />

                                    {p.stakeholders && p.stakeholders.length > 0 && (
                                        <div className="pt-3 border-t border-dashed">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Project Team</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.stakeholders.map((st: any) => (
                                                    <span key={st.id} className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">
                                                        {st.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {p.traits && p.traits.length > 0 && (
                                        <div className="pt-3 border-t border-dashed">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-2">Growth Domains</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.traits.map((tr: any) => (
                                                    <span key={tr.id} className="text-[9px] font-black bg-accent/20 text-accent-foreground px-2 py-0.5 rounded border border-accent/20 uppercase flex items-center gap-1">
                                                        <span className={tr.trait_type === 'technical' ? "text-blue-400" : "text-amber-400"}>●</span>
                                                        {tr.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                </div>
            ))}

            <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} />
            <ProjectAssessmentModal project={assessingProject} onClose={() => setAssessingProject(null)} />
        </div>
    )
}
