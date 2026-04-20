import { useState } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectTemplates } from "@/hooks/useMilestones"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = "http://localhost:8000/api/v1";

async function createProject(data: any) {
    const res = await fetch(`${API_URL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
}

export function CreateProjectModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [projectType, setProjectType] = useState<"deadline_driven" | "evergreen">("deadline_driven")
    const [deadline, setDeadline] = useState("")
    const [selectedTemplateId, setSelectedTemplateId] = useState("")

    const queryClient = useQueryClient()
    const { data: templates } = useProjectTemplates()

    const mutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        const payload: any = {
            name,
            description,
            health_status: "on_track",
            project_type: projectType,
        }
        if (projectType === "deadline_driven" && deadline) {
            payload.external_deadline = new Date(deadline).toISOString()
        }

        mutation.mutate(payload, {
            onSuccess: async (createdProject) => {
                // Auto-apply template milestones if selected
                if (selectedTemplateId) {
                    const applyRes = await fetch(`${API_URL}/projects/${createdProject.id}/apply-template/${selectedTemplateId}`, { method: "POST" });
                    if (applyRes.ok) queryClient.invalidateQueries({ queryKey: ['milestones', createdProject.id] })
                }
                onOpenChange(false)
                setName(""); setDescription(""); setDeadline(""); setSelectedTemplateId(""); setProjectType("deadline_driven")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Initialize Epic (Project)</DialogTitle>
                        <DialogDescription>Bootstrap a new root Epic node for the Personal AI-OS map.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none">Epic Identifier (Name)</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Backend refactoring scaleout" autoFocus />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none">Abstract Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="High-level overview of core objectives" />
                        </div>

                        {/* Project Type Toggle */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none">Project Archetype</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setProjectType("deadline_driven")}
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all text-left ${projectType === "deadline_driven" ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-secondary"}`}>
                                    <div className="font-bold mb-0.5">📅 Deadline-Driven</div>
                                    <div className="text-[11px] text-muted-foreground font-normal">Client delivery, certifications, launches</div>
                                </button>
                                <button type="button" onClick={() => setProjectType("evergreen")}
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all text-left ${projectType === "evergreen" ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : "border-border hover:bg-secondary"}`}>
                                    <div className="font-bold mb-0.5">🌱 Evergreen</div>
                                    <div className="text-[11px] text-muted-foreground font-normal">Training, personal development, ongoing commitments</div>
                                </button>
                            </div>
                        </div>

                        {projectType === "deadline_driven" && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">External Deadline</label>
                                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                            </div>
                        )}

                        {/* Template Picker */}
                        {templates && templates.length > 0 && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">Project Template (optional)</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                                    <option value="">No template — blank project</option>
                                    {templates.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                                    ))}
                                </select>
                                {selectedTemplateId && templates && (
                                    <p className="text-[11px] text-muted-foreground">
                                        Milestones: {templates.find((t: any) => t.id === selectedTemplateId)?.milestone_titles.replace(/\|/g, " → ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending || !name.trim()}>
                            {mutation.isPending ? "Initializing..." : "Publish Epic"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
