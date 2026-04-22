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
import { useCreateStakeholder } from "@/hooks/useStakeholders";
import { useOrganizations } from "@/hooks/useOrganizations";
import { parsePersona, fetchPersona } from "@/lib/api";
import { Loader2, Sparkles, Info, Link as LinkIcon, FileText } from "lucide-react";

interface CreatePersonaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePersonaModal({ open, onOpenChange }: CreatePersonaModalProps) {
    const createMutation = useCreateStakeholder();
    const { data: organizations } = useOrganizations();

    const [formData, setFormData] = useState<any>({
        name: '',
        role: '',
        company: 'Avanade',
        grade: 'peer',
        seniority: 'expert',
        proactivity: 'medium',
        productivity: 'medium',
        skills: '',
        general_description: '',
        can_delegate: false,
        organization_id: '',
        circle: 'same_org'
    });

    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importMode, setImportMode] = useState<'text' | 'url'>('text');
    const [importText, setImportText] = useState("");
    const [importUrl, setImportUrl] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    const handleSmartImport = async () => {
        if (importMode === 'text' && !importText.trim()) return;
        if (importMode === 'url' && !importUrl.trim()) return;

        setIsParsing(true);
        try {
            const result = importMode === 'text'
                ? await parsePersona(importText)
                : await fetchPersona(importUrl);

            setFormData((prev: any) => ({
                ...prev,
                name: result.name || prev.name,
                role: result.role || prev.role,
                company: result.company || prev.company,
                skills: result.skills || prev.skills,
                general_description: result.general_description || prev.general_description,
                seniority: result.seniority || prev.seniority,
            }));
            setIsImportOpen(false);
            setImportText("");
            setImportUrl("");
        } catch (error: any) {
            console.error("AI Parsing failed:", error);
            alert(error.message || "Failed to parse profile. Please try the manual paste method.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Clean up empty uuid
        const payload = { ...formData };
        if (!payload.organization_id) delete payload.organization_id;

        await createMutation.mutateAsync(payload);
        onOpenChange(false);
        setFormData({
            name: '',
            role: '',
            company: 'Avanade',
            grade: 'peer',
            seniority: 'expert',
            proactivity: 'medium',
            productivity: 'medium',
            skills: '',
            general_description: '',
            can_delegate: false,
            organization_id: ''
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Register New Teammate Persona</DialogTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 border-primary/30 hover:bg-primary/5 transition-colors"
                            onClick={() => setIsImportOpen(!isImportOpen)}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Smart Import
                        </Button>
                    </div>
                </DialogHeader>

                {isImportOpen && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-2 border-b border-primary/10 pb-2">
                            <Button
                                type="button"
                                variant={importMode === 'text' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-[10px] uppercase font-bold h-7 gap-1.5"
                                onClick={() => setImportMode('text')}
                            >
                                <FileText className="w-3 h-3" /> Manual Paste
                            </Button>
                            <Button
                                type="button"
                                variant={importMode === 'url' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-[10px] uppercase font-bold h-7 gap-1.5"
                                onClick={() => setImportMode('url')}
                            >
                                <LinkIcon className="w-3 h-3" /> Auto-Fetch URL
                            </Button>
                        </div>

                        {importMode === 'url' ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-primary/70">
                                    <Info className="w-3.5 h-3.5 mt-0.5" />
                                    <p className="text-[10px] font-medium leading-relaxed italic">
                                        Note: LinkedIn blocks many automated requests. If this fails, use 'Manual Paste'.
                                    </p>
                                </div>
                                <Input
                                    placeholder="https://www.linkedin.com/in/username/"
                                    className="bg-background/80 text-xs border-primary/10"
                                    value={importUrl}
                                    onChange={(e) => setImportUrl(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-primary">
                                    <Info className="w-4 h-4 mt-0.5" />
                                    <p className="text-[11px] font-medium leading-relaxed">
                                        Copy the full text from their profile and paste it here for instant AI parsing.
                                    </p>
                                </div>
                                <Textarea
                                    placeholder="Paste LinkedIn profile content here..."
                                    className="bg-background/80 min-h-[120px] text-xs border-primary/10"
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex justify-end pt-2 border-t border-primary/10">
                            <Button
                                type="button"
                                size="sm"
                                disabled={isParsing || (importMode === 'text' ? !importText.trim() : !importUrl.trim())}
                                onClick={handleSmartImport}
                                className="bg-primary hover:bg-primary/90 min-w-[120px] transition-all"
                            >
                                {isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                                {importMode === 'url' ? "Fetch & Extract" : "AI Extract"}
                            </Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
                            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</label>
                            <Input name="role" value={formData.role} onChange={handleChange} required placeholder="e.g. Solution Architect" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organization</label>
                            <select
                                name="organization_id"
                                value={formData.organization_id}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Organization (Optional)</option>
                                {organizations?.map((org: any) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Circle</label>
                            <select
                                name="circle"
                                value={formData.circle}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="teammate">Teammate</option>
                                <option value="client">Client</option>
                                <option value="same_org">Same Organization</option>
                                <option value="different_org">Different Organization</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seniority</label>
                            <select name="seniority" value={formData.seniority} onChange={handleChange} className="w-full h-10 bg-background border rounded-md px-3 text-sm">
                                <option value="junior">Junior</option>
                                <option value="expert">Expert</option>
                                <option value="manager">Manager</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grade</label>
                            <select name="grade" value={formData.grade} onChange={handleChange} className="w-full h-10 bg-background border rounded-md px-3 text-sm">
                                <option value="above">Above</option>
                                <option value="peer">Peer</option>
                                <option value="below">Below</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proactivity</label>
                            <select name="proactivity" value={formData.proactivity} onChange={handleChange} className="w-full h-10 bg-background border rounded-md px-3 text-sm">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Productivity</label>
                            <select name="productivity" value={formData.productivity} onChange={handleChange} className="w-full h-10 bg-background border rounded-md px-3 text-sm">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skills</label>
                        <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Python, AWS" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Description</label>
                        <Textarea
                            name="general_description"
                            value={formData.general_description}
                            onChange={handleChange}
                            placeholder="Context for AI analysis..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex items-center space-x-2 bg-secondary/20 p-4 rounded-xl border border-border/50">
                        <input
                            type="checkbox"
                            id="can_delegate_create"
                            name="can_delegate"
                            checked={formData.can_delegate}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="can_delegate_create" className="text-sm font-bold text-foreground cursor-pointer">
                            Authorized for Task Delegation
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending} className="font-bold px-8">
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Persona
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
