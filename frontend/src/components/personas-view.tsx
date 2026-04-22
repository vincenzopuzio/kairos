import { useStakeholders, useDeleteStakeholder } from "@/hooks/useStakeholders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InteractionJournalView } from "./interaction-journal-view"
import { useState, useMemo } from "react"
import { History, Edit3, Trash2, Plus, Globe, Users } from "lucide-react"
import { Button } from "./ui/button"
import { EditPersonaModal } from "./edit-persona-modal"
import { CreatePersonaModal } from "./create-persona-modal"
import { OrganizationManager } from "./organization-manager"

const CIRCLE_LABELS: Record<string, string> = {
    teammate: "Teammate",
    client: "Client",
    same_org: "Same Organization",
    different_org: "Different Organization"
}

export function PersonasView() {
    const { data: stakeholders, isLoading } = useStakeholders()
    const deleteMutation = useDeleteStakeholder()

    const groupedStakeholders = useMemo(() => {
        return stakeholders?.reduce((acc: any, st: any) => {
            const orgName = st.org?.name || st.company || "Independent / Unassigned"
            if (!acc[orgName]) acc[orgName] = []
            acc[orgName].push(st)
            return acc
        }, {}) || {}
    }, [stakeholders])

    const [selectedJournalStakeholder, setSelectedJournalStakeholder] = useState<any>(null);
    const [editingStakeholder, setEditingStakeholder] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isOrgManagerOpen, setIsOrgManagerOpen] = useState(false);

    const handleDelete = async (st: any) => {
        if (confirm(`Are you sure you want to delete ${st.name}? This will remove all their interaction history.`)) {
            await deleteMutation.mutateAsync(st.id);
        }
    }

    if (selectedJournalStakeholder) {
        return <InteractionJournalView stakeholder={selectedJournalStakeholder} onBack={() => setSelectedJournalStakeholder(null)} />
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Teammate Personas</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your professional network and relationship strategies.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsOrgManagerOpen(true)}>
                        <Globe className="w-4 h-4" /> Manage Orgs
                    </Button>
                    <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Add Teammate
                    </Button>
                </div>
            </div>

            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && Object.entries(groupedStakeholders).map(([company, orgStakeholders]: [string, any]) => (
                <div key={company} className="bg-background/40 border border-border/50 rounded-xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <span className="text-xl bg-primary/10 text-primary p-2 rounded-md">🏢</span>
                        {company}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {orgStakeholders.map((st: any) => (
                            <Card key={st.id} className="shadow-sm bg-background relative overflow-hidden group border-border hover:border-primary/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="relative z-10">
                                    <CardHeader className="relative">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-xl font-black tracking-tight leading-none">
                                                {st.name}
                                            </CardTitle>
                                            <div className="flex gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-all border-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingStakeholder(st);
                                                    }}
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all border-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(st);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="font-medium text-muted-foreground/80 mt-1 uppercase text-[10px] tracking-widest">{st.role}</CardDescription>

                                        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/40">
                                            <span className="text-[9px] uppercase font-black px-2 py-1 bg-secondary/50 text-secondary-foreground rounded border whitespace-nowrap">
                                                {st.interaction_type}
                                            </span>
                                            <span className="text-[9px] uppercase font-black px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20 flex items-center gap-1.5 whitespace-nowrap">
                                                <Users className="w-3 h-3" /> {CIRCLE_LABELS[st.circle || 'same_org']}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pt-2">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                                <span className="text-muted-foreground block mb-1">Grade</span>
                                                <span className="font-semibold capitalize">{st.grade}</span>
                                            </div>
                                            <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                                <span className="text-muted-foreground block mb-1">Seniority</span>
                                                <span className="font-semibold capitalize">{st.seniority}</span>
                                            </div>
                                            <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                                <span className="text-muted-foreground block mb-1">Proact.</span>
                                                <span className="font-semibold capitalize">{st.proactivity}</span>
                                            </div>
                                            <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                                <span className="text-muted-foreground block mb-1">Product.</span>
                                                <span className="font-semibold capitalize">{st.productivity}</span>
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            <strong className="text-foreground/80 block mb-1 text-[10px] uppercase tracking-wider">Core Skills</strong>
                                            <p className="text-primary font-mono text-[11px] font-bold">{st.skills || "N/A"}</p>
                                        </div>

                                        <p className="text-xs text-foreground/70 italic border-l-2 border-primary/40 pl-3 leading-relaxed">
                                            "{st.general_description || "Unassigned context."}"
                                        </p>

                                        {!st.can_delegate && (
                                            <div className="text-[10px] text-destructive font-bold uppercase tracking-wider flex items-center gap-1.5 pt-3 border-t mt-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                Explicitly Blocked
                                            </div>
                                        )}

                                        <div className="pt-4 border-t mt-4">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full gap-2 text-[10px] font-black uppercase tracking-widest py-4 bg-secondary/80 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                                                onClick={() => setSelectedJournalStakeholder(st)}
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                Relationship Journal
                                            </Button>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {!isLoading && (!stakeholders || stakeholders.length === 0) && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl mt-8 opacity-60">
                    <h3 className="text-xl font-bold mb-2">No Personas Defined</h3>
                    <p className="text-muted-foreground">Map your team architecture to leverage robust AI delegation features.</p>
                </div>
            )}

            <EditPersonaModal
                stakeholder={editingStakeholder}
                open={!!editingStakeholder}
                onOpenChange={(open) => !open && setEditingStakeholder(null)}
            />

            <CreatePersonaModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            <OrganizationManager
                open={isOrgManagerOpen}
                onOpenChange={setIsOrgManagerOpen}
            />
        </div>
    )
}
