import { useState } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

const API_URL = "http://localhost:8000/api/v1";

async function createAssessment({ projectId, data }: { projectId: string, data: any }) {
    const res = await fetch(`${API_URL}/projects/${projectId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, project_id: projectId })
    });
    if (!res.ok) throw new Error("Failed to save assessment");
    return res.json();
}

export function ProjectAssessmentModal({ project, onClose }: { project: any | null, onClose: () => void }) {
    const [summary, setSummary] = useState("")
    const [lessonsLearned, setLessonsLearned] = useState("")
    const [rating, setRating] = useState(3)

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: createAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['projects', project?.id] })
            onClose()
            setSummary(""); setLessonsLearned(""); setRating(3)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!project) return
        mutation.mutate({
            projectId: project.id,
            data: {
                summary,
                lessons_learned: lessonsLearned,
                rating
            }
        })
    }

    if (!project) return null

    return (
        <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4 tracking-tight">Assessment Moment</span>
                            <span className="text-muted-foreground font-normal">/</span>
                            <span className="truncate max-w-[200px]">{project.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Reflect on the execution delta and capture high-entropy learnings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Execution Summary</label>
                            <Textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="What was achieved during this phase? Any major blockers overcome?"
                                rows={3}
                                className="bg-secondary/20"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Logarithmic Learnings</label>
                            <Textarea
                                value={lessonsLearned}
                                onChange={(e) => setLessonsLearned(e.target.value)}
                                placeholder="Strategic insights that will improve future cycles..."
                                rows={4}
                                className="bg-secondary/20 border-accent/20"
                            />
                        </div>

                        <div className="grid gap-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Execution Fidelity Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-2 rounded-md transition-all ${rating >= star ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-muted-foreground bg-secondary hover:bg-secondary/80 border-transparent"} border`}
                                    >
                                        <Star className={`w-5 h-5 ${rating >= star ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-secondary/10 -mx-6 -mb-6 p-6 mt-2 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending || !summary.trim() || !lessonsLearned.trim()} className="font-bold">
                            {mutation.isPending ? "Committing Observation..." : "Commit Reflection"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
