import { useState, useEffect } from "react"
import { useUpdateTask } from "@/hooks/useTasks"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function EditTaskModal({ task, open, onOpenChange }: { task: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<number>(3)
    const [urgency, setUrgency] = useState(2)
    const [importance, setImportance] = useState(2)
    const [isFrog, setIsFrog] = useState(false)
    const [status, setStatus] = useState("todo")
    const [isDeepWork, setIsDeepWork] = useState(false)

    const updateTaskMutation = useUpdateTask()

    useEffect(() => {
        if (task) {
            setTitle(task.title || "")
            setDescription(task.description || "")
            setPriority(task.priority || 3)
            setUrgency(task.urgency || 2)
            setImportance(task.importance || 2)
            setIsFrog(task.is_frog || false)
            setStatus(task.status || "todo")
            setIsDeepWork(task.is_deep_work || false)
        }
    }, [task])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !task) return

        updateTaskMutation.mutate({
            id: task.id,
            title,
            description,
            priority: Number(priority),
            urgency,
            importance,
            is_frog: isFrog,
            status,
            is_deep_work: isDeepWork
        }, {
            onSuccess: () => {
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Modify Node Matrix</DialogTitle>
                        <DialogDescription>
                            Architecturally re-route the parameters of this task definition.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="edit-title" className="text-sm font-medium leading-none">Task Title</label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                                placeholder="Core UI update..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-desc" className="text-sm font-medium leading-none">Task Analysis</label>
                            <Textarea
                                id="edit-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Details, technical notes, or specific requirements..."
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-status" className="text-sm font-medium leading-none">Status</label>
                            <select
                                id="edit-status"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Completed</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-priority" className="text-sm font-medium leading-none">Priority Vector (1-4)</label>
                            <select
                                id="edit-priority"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={priority}
                                onChange={(e) => setPriority(Number(e.target.value))}
                            >
                                <option value={1}>1 - Ascendant (Critical)</option>
                                <option value={2}>2 - High</option>
                                <option value={3}>3 - Standard</option>
                                <option value={4}>4 - Background</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid gap-2">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Urgency</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={urgency} onChange={(e) => setUrgency(parseInt(e.target.value))}>
                                    <option value={1}>Low</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>High</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Importance</label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={importance} onChange={(e) => setImportance(parseInt(e.target.value))}>
                                    <option value={1}>Low</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 bg-secondary/30 p-3 rounded-lg border border-border">
                            <input
                                type="checkbox"
                                id="edit-is-frog"
                                checked={isFrog}
                                onChange={(e) => setIsFrog(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
                            />
                            <label htmlFor="edit-is-frog" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
                                🐸 Eat the Frog (Critical)
                            </label>
                        </div>

                        <div className="flex items-center gap-2 mt-2 bg-secondary/30 p-3 rounded-lg border border-border">
                            <input
                                type="checkbox"
                                id="edit-deep-work"
                                checked={isDeepWork}
                                onChange={(e) => setIsDeepWork(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
                            />
                            <label htmlFor="edit-deep-work" className="text-sm font-semibold leading-none text-foreground flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Isolate as Deep Work
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={updateTaskMutation.isPending || !title.trim()}>
                            {updateTaskMutation.isPending ? "Applying Mutators..." : "Commit Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
