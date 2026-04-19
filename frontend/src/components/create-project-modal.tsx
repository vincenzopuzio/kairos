import { useState } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        mutation.mutate({
            name,
            description,
            health_status: "on_track",
            external_deadline: new Date(Date.now() + 86400000 * 30).toISOString()
        }, {
            onSuccess: () => {
                onOpenChange(false)
                setName("")
                setDescription("")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Initialize Epic (Project)</DialogTitle>
                        <DialogDescription>
                            Bootstrap a new root Epic node for the Personal AI-OS map.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none">Epic Identifier (Name)</label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Backend refactoring scaleout"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="desc-proj" className="text-sm font-medium leading-none">Abstract Description</label>
                            <Input
                                id="desc-proj"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="High-level overview of core objectives involved"
                            />
                        </div>
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
