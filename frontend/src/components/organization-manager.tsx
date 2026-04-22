import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from "@/hooks/useOrganizations";
import { Loader2, Plus, Edit2, Trash2, Globe } from "lucide-react";

interface OrganizationManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrganizationManager({ open, onOpenChange }: OrganizationManagerProps) {
    const { data: organizations, isLoading } = useOrganizations();
    const createMutation = useCreateOrganization();
    const updateMutation = useUpdateOrganization();
    const deleteMutation = useDeleteOrganization();

    const [editingOrg, setEditingOrg] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', industry: '' });

    const handleEdit = (org: any) => {
        setEditingOrg(org);
        setFormData({ name: org.name, description: org.description || '', industry: org.industry || '' });
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingOrg(null);
        setFormData({ name: '', description: '', industry: '' });
        setIsCreating(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOrg) {
            await updateMutation.mutateAsync({ id: editingOrg.id, ...formData });
        } else {
            await createMutation.mutateAsync(formData);
        }
        setEditingOrg(null);
        setIsCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This will un-link all associated personas.")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Professional Organizations
                    </DialogTitle>
                    <Button size="sm" onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" /> New Org
                    </Button>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {(isCreating || editingOrg) && (
                        <Card className="p-4 bg-secondary/10 border-primary/20">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest">
                                    {isCreating ? "Register New Organization" : `Update ${editingOrg.name}`}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Org Name</label>
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Industry</label>
                                        <Input value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Description</label>
                                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <DialogFooter className="pt-4 mt-4 border-t">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingOrg(null); }}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        {isCreating ? "Save Organization" : "Apply Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Card>
                    )}

                    <div className="grid gap-3">
                        {isLoading ? (
                            <div className="h-20 bg-secondary animate-pulse rounded-xl" />
                        ) : (
                            organizations?.map((org: any) => (
                                <div key={org.id} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-primary/40 transition-all">
                                    <div>
                                        <h4 className="font-bold text-foreground">{org.name}</h4>
                                        <p className="text-xs text-muted-foreground">{org.industry || "General Professional"}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(org)}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(org.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                        {!isLoading && (!organizations || organizations.length === 0) && (
                            <div className="text-center py-10 opacity-40 italic text-sm">
                                No organizations registered yet.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Minimal Card component for local use if needed, or import from ui/card
function Card({ children, className }: any) {
    return <div className={`rounded-xl border shadow-sm ${className}`}>{children}</div>;
}
