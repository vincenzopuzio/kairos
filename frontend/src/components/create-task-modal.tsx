import { useState, useEffect } from "react"
import { useCreateTask, useProjects } from "@/hooks/useTasks"
import { useMilestones } from "@/hooks/useMilestones"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/stores/useAppStore"

interface CreateTaskModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
    const selectedProjectId = useAppStore(state => state.selectedProjectId)
    const setSelectedProjectId = useAppStore(state => state.setSelectedProjectId)
    const selectedParentTaskId = useAppStore(state => state.selectedParentTaskId)
    const setSelectedParentTaskId = useAppStore(state => state.setSelectedParentTaskId)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [projectId, setProjectId] = useState("")
    const [parentId, setParentId] = useState("")
    const [milestoneId, setMilestoneId] = useState("")
    const [priority, setPriority] = useState<number>(3)
    const [isDeepWork, setIsDeepWork] = useState(false)

    useEffect(() => {
        if (open) {
            setProjectId(selectedProjectId || "")
            setParentId(selectedParentTaskId || "")
        }
    }, [open, selectedProjectId, selectedParentTaskId])

    const { data: projects } = useProjects()
    const { data: milestones } = useMilestones(projectId || undefined)
    const createTaskMutation = useCreateTask()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        createTaskMutation.mutate({
            title,
            description,
            project_id: projectId || undefined,
            milestone_id: milestoneId || undefined,
            parent_id: parentId || undefined,
            priority: Number(priority),
            is_deep_work: isDeepWork,
            status: "todo"
        }, {
            onSuccess: () => {
                onOpenChange(false)
                setSelectedProjectId(null)
                setSelectedParentTaskId(null)
                setTitle(""); setDescription(""); setProjectId(""); setParentId(""); setMilestoneId(""); setPriority(3); setIsDeepWork(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Deploy a new deterministic node into the AI-OS system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none">Task Title</label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Database architecture design"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="desc" className="text-sm font-medium leading-none">Task Analysis</label>
                            <Input
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Requires heavy analysis of standard replication setups"
                            />
                        </div>
                        {projects && projects.length > 0 && (
                            <div className="grid gap-2">
                                <label htmlFor="project" className="text-sm font-medium leading-none">Linked Project Hierarchy</label>
                                <select id="project" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={projectId} onChange={(e) => { setProjectId(e.target.value); setMilestoneId("") }}>
                                    <option value="">No Project (Standalone Floating Task)</option>
                                    {projects.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {projectId && milestones && milestones.length > 0 && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">Milestone Phase (optional)</label>
                                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
                                    <option value="">No specific milestone</option>
                                    {milestones.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.title}{m.is_completed ? " ✓" : ""}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <label htmlFor="priority" className="text-sm font-medium leading-none">Priority Level</label>
                            <select
                                id="priority"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={priority}
                                onChange={(e) => setPriority(Number(e.target.value))}
                            >
                                <option value={1}>1 - Critical</option>
                                <option value={2}>2 - High</option>
                                <option value={3}>3 - Normal</option>
                                <option value={4}>4 - Background</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-2 bg-secondary/30 p-3 rounded-lg border border-border">
                            <input
                                type="checkbox"
                                id="create-deep-work"
                                checked={isDeepWork}
                                onChange={(e) => setIsDeepWork(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
                            />
                            <label htmlFor="create-deep-work" className="text-sm font-semibold leading-none text-foreground flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Isolate as Deep Work
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={createTaskMutation.isPending || !title.trim()}>
                            {createTaskMutation.isPending ? "Creating..." : "Save Task Node"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
