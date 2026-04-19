import { useState } from "react"
import { useCreateTask, useProjects } from "@/hooks/useTasks"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateTaskModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [projectId, setProjectId] = useState("")

    const { data: projects } = useProjects()
    const createTaskMutation = useCreateTask()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        createTaskMutation.mutate({
            title,
            description,
            project_id: projectId || undefined,
            priority: 3,
            is_deep_work: false,
            status: "todo"
        }, {
            onSuccess: () => {
                onOpenChange(false)
                setTitle("")
                setDescription("")
                setProjectId("")
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
                                <select
                                    id="project"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                >
                                    <option value="">No Project (Standalone Floating Task)</option>
                                    {projects.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
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
