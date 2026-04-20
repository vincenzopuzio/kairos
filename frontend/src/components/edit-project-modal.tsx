import { useState, useEffect } from "react"
import { useUpdateProject, useProjects } from "@/hooks/useTasks"
import { useMilestones, useMilestoneMutations, useProjectTemplates } from "@/hooks/useMilestones"
import { useProjectDependencies, useProjectDependencyMutations } from "@/hooks/useProjectDependencies"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function EditProjectModal({ project, onClose }: { project: any, onClose: () => void }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [healthStatus, setHealthStatus] = useState("on_track")
    const [projectType, setProjectType] = useState("deadline_driven")
    const [startDate, setStartDate] = useState("")
    const [deadline, setDeadline] = useState("")
    const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
    const [selectedDepId, setSelectedDepId] = useState("")

    const { mutateAsync: updateProject, isPending } = useUpdateProject()
    const { data: milestones } = useMilestones(project?.id)
    const { data: templates } = useProjectTemplates()
    const { create, update, remove, applyTemplate } = useMilestoneMutations(project?.id)
    const { data: allProjects } = useProjects()
    const { data: dependencies } = useProjectDependencies(project?.id)
    const { add: addDep, remove: removeDep } = useProjectDependencyMutations(project?.id)

    useEffect(() => {
        if (project) {
            setName(project.name)
            setDescription(project.description || "")
            setHealthStatus(project.health_status)
            setProjectType(project.project_type || "deadline_driven")
            setStartDate(project.start_date ? new Date(project.start_date).toISOString().slice(0, 10) : "")
            setDeadline(project.external_deadline ? new Date(project.external_deadline).toISOString().slice(0, 10) : "")
        }
    }, [project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        await updateProject({
            id: project.id,
            name,
            description,
            health_status: healthStatus,
            project_type: projectType,
            start_date: startDate ? new Date(startDate).toISOString() : null,
            external_deadline: projectType === "deadline_driven" && deadline ? new Date(deadline).toISOString() : null
        })
        onClose()
    }

    const handleAddMilestone = async () => {
        if (!newMilestoneTitle.trim()) return
        await create.mutateAsync({ title: newMilestoneTitle, order: milestones?.length ?? 0 })
        setNewMilestoneTitle("")
    }

    if (!project) return null

    const completedCount = milestones?.filter((m: any) => m.is_completed).length ?? 0
    const totalCount = milestones?.length ?? 0

    return (
        <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Epic Matrix</DialogTitle>
                        <DialogDescription>Modify lifecycle constraints and track milestone progress.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Core fields */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Epic Identifier</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Abstract Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Health Status</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}>
                                    <option value="on_track">On Track</option>
                                    <option value="at_risk">At Risk</option>
                                    <option value="delayed">Delayed</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Project Type</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                                    <option value="deadline_driven">📅 Deadline-Driven</option>
                                    <option value="evergreen">🌱 Evergreen</option>
                                </select>
                            </div>
                        </div>
                        {projectType === "deadline_driven" && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">External Deadline</label>
                                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                            </div>
                        )}

                        <div className="grid gap-2 border-t pt-4">
                            <label className="text-sm font-medium">Scheduled Start Date (optional)</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <p className="text-[10px] text-muted-foreground italic">Manual override. If empty, AI OS will auto-sequence based on dependencies.</p>
                        </div>

                        {/* Dependencies Section */}
                        <div className="grid gap-2 border-t pt-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10" /><path d="m17 7-10 10" /></svg>
                                    Project Sequence Constraints (Gate)
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={selectedDepId} onChange={(e) => setSelectedDepId(e.target.value)}>
                                    <option value="">Block this project until…</option>
                                    {allProjects?.filter((p: any) => p.id !== project.id && !dependencies?.some((d: any) => d.depends_on_id === p.id)).map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <Button type="button" size="sm" variant="secondary" className="h-9"
                                    disabled={!selectedDepId} onClick={() => { addDep.mutate(selectedDepId); setSelectedDepId("") }}>
                                    Add Gate
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-1">
                                {dependencies?.map((dep: any) => {
                                    const gateProject = allProjects?.find((p: any) => p.id === dep.depends_on_id);
                                    return (
                                        <div key={dep.depends_on_id} className="flex items-center gap-1.5 px-2 py-1 bg-secondary/80 rounded-md text-[11px] font-bold border border-border group">
                                            <span>After: {gateProject?.name}</span>
                                            <button type="button" onClick={() => removeDep.mutate(dep.depends_on_id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                    );
                                })}
                                {(!dependencies || dependencies.length === 0) && (
                                    <p className="text-[10px] text-muted-foreground">No sequence constraints. This project can start immediately.</p>
                                )}
                            </div>
                        </div>

                        {/* Milestones Section */}
                        <div className="border-t pt-4 space-y-3">

                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold">Milestones</h4>
                                    {totalCount > 0 && (
                                        <p className="text-[11px] text-muted-foreground">{completedCount}/{totalCount} completed</p>
                                    )}
                                </div>
                                {templates && templates.length > 0 && (
                                    <select className="text-xs border rounded px-2 py-1 bg-background"
                                        onChange={(e) => e.target.value && applyTemplate.mutateAsync(e.target.value)}
                                        defaultValue="">
                                        <option value="">Apply template…</option>
                                        {templates.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Progress bar */}
                            {totalCount > 0 && (
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${(completedCount / totalCount) * 100}%` }} />
                                </div>
                            )}

                            {/* Milestone list */}
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {(milestones ?? []).map((m: any) => (
                                    <div key={m.id} className="flex items-center gap-2 group rounded p-1.5 hover:bg-secondary/40">
                                        <input type="checkbox" checked={m.is_completed}
                                            onChange={(e) => update.mutateAsync({ id: m.id, is_completed: e.target.checked })}
                                            className="h-4 w-4 rounded border-border" />
                                        <span className={`flex-1 text-sm ${m.is_completed ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                                        <button type="button" onClick={() => remove.mutateAsync(m.id)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add milestone */}
                            <div className="flex gap-2">
                                <Input placeholder="+ New milestone…" value={newMilestoneTitle}
                                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMilestone() } }}
                                    className="text-sm h-8" />
                                <Button type="button" size="sm" variant="outline" onClick={handleAddMilestone} disabled={!newMilestoneTitle.trim()}>Add</Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending || !name.trim()}>
                            {isPending ? "Saving..." : "Save Lifecycle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
