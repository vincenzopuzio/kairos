import { useState } from 'react'
import { useTraits, useCreateTrait, useCreateAudit, useTraitDetail, useGrowthAdvisory, useUpdateTrait, useDeleteTrait } from '@/hooks/useSelfMirror'
import { useCreateTask } from '@/hooks/useTasks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, History, Star, Shield, ShieldAlert, Sparkles, Brain, Cpu, MessageSquareQuote, Check, Pencil } from "lucide-react"

export function SelfMirrorView() {
    const { data: traits, isLoading } = useTraits()
    const { mutate: getAdvisory, data: advisoryData, isPending: isAdvisoryLoading } = useGrowthAdvisory()
    const { mutate: createTask, isPending: isCreatingTask } = useCreateTask()
    const [trackedTasks, setTrackedTasks] = useState<Record<number, boolean>>({})
    const [selectedTraitId, setSelectedTraitId] = useState<string | null>(null)
    const [editingTrait, setEditingTrait] = useState<any | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
    const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'technical'>('all')

    const filteredTraits = traits?.filter((t: any) => typeFilter === 'all' || t.trait_type === typeFilter) || []

    const strengths = filteredTraits.filter((t: any) => t.category === 'strength')
    const weaknesses = filteredTraits.filter((t: any) => t.category === 'weakness')
    const disasters = filteredTraits.filter((t: any) => t.category === 'disaster')

    const handleTrackTask = (task: any, index: number) => {
        if (!advisoryData?.growth_epic_id) return
        createTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            project_id: advisoryData.growth_epic_id,
            status: 'todo'
        }, {
            onSuccess: () => {
                setTrackedTasks(prev => ({ ...prev, [index]: true }))
            }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex items-end justify-between border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground text-shadow-glow">Self-Mirror</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest italic opacity-70">Personal Audit & Growth Engine</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/50">
                        {(['all', 'general', 'technical'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setTypeFilter(f)}
                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${typeFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="font-bold shadow-md gap-2 h-9">
                        <Plus className="w-4 h-4" /> Define Trait
                    </Button>
                </div>
            </div>

            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && (!traits || traits.length === 0) && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl bg-secondary/5">
                    <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">The Mirror is Empty</h3>
                    <p className="text-muted-foreground mb-6">Start by defining your core strengths and areas for improvement to activate the Growth Engine.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>Initialize Baseline</Button>
                </div>
            )}

            {!isLoading && traits && traits.length > 0 && (
                <div className="space-y-12">
                    {/* Disasters Section (Horizontal or Highlighted) */}
                    {disasters.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter text-red-500 animate-pulse">
                                <ShieldAlert className="w-6 h-6" /> Critical Blindspots
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                {disasters.map((trait: any) => (
                                    <TraitCard
                                        key={trait.id}
                                        trait={trait}
                                        onAudit={() => {
                                            setSelectedTraitId(trait.id)
                                            setIsAuditModalOpen(true)
                                        }}
                                        onEdit={() => setEditingTrait(trait)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Strengths Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight text-emerald-500">
                                <Shield className="w-5 h-5" /> Core Strengths
                            </h2>
                            <div className="space-y-4">
                                {strengths.map((trait: any) => (
                                    <TraitCard
                                        key={trait.id}
                                        trait={trait}
                                        onAudit={() => {
                                            setSelectedTraitId(trait.id)
                                            setIsAuditModalOpen(true)
                                        }}
                                        onEdit={() => setEditingTrait(trait)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight text-amber-500">
                                <ShieldAlert className="w-5 h-5" /> Growth Areas
                            </h2>
                            <div className="space-y-4">
                                {weaknesses.map((trait: any) => (
                                    <TraitCard
                                        key={trait.id}
                                        trait={trait}
                                        onAudit={() => {
                                            setSelectedTraitId(trait.id)
                                            setIsAuditModalOpen(true)
                                        }}
                                        onEdit={() => setEditingTrait(trait)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Advisory Section */}
            <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter text-primary">
                        <Brain className="w-6 h-6" /> Metis Growth Advisory
                    </h2>
                    <Button
                        variant="secondary"
                        onClick={() => getAdvisory()}
                        disabled={isAdvisoryLoading || !traits?.length}
                        className="font-bold gap-2"
                    >
                        {isAdvisoryLoading ? <Cpu className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Strategic Insights
                    </Button>
                </div>

                {isAdvisoryLoading && (
                    <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center space-y-4 bg-primary/5">
                        <Cpu className="w-12 h-12 text-primary animate-spin" />
                        <p className="font-bold animate-pulse uppercase tracking-widest text-xs">Metis is analyzing your trait ledger...</p>
                    </div>
                )}

                {advisoryData && (
                    <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
                        <div className="bg-primary/20 p-4 border-b border-primary/20 flex items-center gap-2">
                            <MessageSquareQuote className="w-5 h-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Strategic Insight</span>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <p className="text-lg font-medium leading-relaxed italic text-foreground/90">
                                "{advisoryData.insight}"
                            </p>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggested Growth Actions</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {advisoryData.suggested_tasks.map((task: any, idx: number) => (
                                        <Card key={idx} className="bg-background/80 border-primary/10 hover:border-primary/30 transition-all flex flex-col">
                                            <CardContent className="p-4 flex-1">
                                                <h5 className="font-bold text-sm mb-1">{task.title}</h5>
                                                <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold">Priority: {task.priority}</Badge>
                                            </CardContent>
                                            <div className="p-4 pt-0">
                                                <Button
                                                    size="sm"
                                                    variant={trackedTasks[idx] ? "outline" : "secondary"}
                                                    className="w-full text-[10px] font-black uppercase gap-1"
                                                    onClick={() => handleTrackTask(task, idx)}
                                                    disabled={trackedTasks[idx] || isCreatingTask}
                                                >
                                                    {trackedTasks[idx] ? (
                                                        <><Check className="w-3 h-3" /> Tracked</>
                                                    ) : (
                                                        <><Plus className="w-3 h-3" /> Track Action</>
                                                    )}
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modals */}
            {isCreateModalOpen && <CreateTraitModal onClose={() => setIsCreateModalOpen(false)} />}
            {editingTrait && <EditTraitModal trait={editingTrait} onClose={() => setEditingTrait(null)} />}
            {isAuditModalOpen && selectedTraitId && (
                <ReflectionModal
                    traitId={selectedTraitId}
                    onClose={() => {
                        setIsAuditModalOpen(false)
                        setSelectedTraitId(null)
                    }}
                />
            )}
        </div>
    )
}

function TraitCard({ trait, onAudit, onEdit }: { trait: any, onAudit: () => void, onEdit: () => void }) {
    const isDisaster = trait.category === 'disaster'
    return (
        <Card className={`group hover:border-primary/40 transition-all cursor-default border-border/50 backdrop-blur-sm relative overflow-hidden ${isDisaster ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-card/40'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${trait.category === 'strength' ? 'bg-emerald-500/40' : trait.category === 'disaster' ? 'bg-red-500' : 'bg-amber-500/40'}`} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className={`text-lg font-bold uppercase tracking-tight ${isDisaster ? 'text-red-500' : ''}`}>{trait.name}</CardTitle>
                        <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground opacity-60">
                            {trait.trait_type}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onEdit}>
                            <Pencil className="w-3 h-3" />
                        </Button>
                        <Badge variant={isDisaster ? "destructive" : "outline"} className="text-[10px] font-black uppercase">
                            Impact: {trait.impact}/5
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-2">{trait.description || "No description provided."}</p>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/60">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= trait.impact ? 'fill-primary text-primary' : 'text-muted/20'}`} />
                        ))}
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={onAudit}>
                        <History className="w-3 h-3" /> Reflect
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function EditTraitModal({ trait, onClose }: { trait: any, onClose: () => void }) {
    const { mutate: updateTrait } = useUpdateTrait(trait.id)
    const { mutate: deleteTrait } = useDeleteTrait()
    const [name, setName] = useState(trait.name)
    const [category, setCategory] = useState<'strength' | 'weakness' | 'disaster'>(trait.category)
    const [trait_type, setTraitType] = useState<'general' | 'technical'>(trait.trait_type)
    const [impact, setImpact] = useState(trait.impact)
    const [description, setDescription] = useState(trait.description || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateTrait({ name, category, trait_type, impact, description }, {
            onSuccess: () => onClose()
        })
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this trait? All related audits will be lost.")) {
            deleteTrait(trait.id, {
                onSuccess: () => onClose()
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-2">
                <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Edit Trait</CardTitle>
                    <CardDescription>Modify or remove this attribute from your mirror.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Trait Name</label>
                            <input
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Category</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                >
                                    <option value="strength">Strength</option>
                                    <option value="weakness">Growth Area</option>
                                    <option value="disaster">💥 Disaster</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Type Domain</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                    value={trait_type}
                                    onChange={e => setTraitType(e.target.value as any)}
                                >
                                    <option value="general">General (Soft)</option>
                                    <option value="technical">Technical (Hard)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Impact Profile</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                value={impact}
                                onChange={e => setImpact(parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Description / Context</label>
                            <textarea
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm h-24 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="flex-1 font-bold" onClick={onClose}>Cancel</Button>
                            <Button type="submit" className="flex-1 font-bold">Save Changes</Button>
                        </div>
                        <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs" onClick={handleDelete}>
                            Delete Trait
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

function CreateTraitModal({ onClose }: { onClose: () => void }) {
    const { mutate: createTrait } = useCreateTrait()
    const [name, setName] = useState('')
    const [category, setCategory] = useState<'strength' | 'weakness' | 'disaster'>('strength')
    const [trait_type, setTraitType] = useState<'general' | 'technical'>('general')
    const [impact, setImpact] = useState(3)
    const [description, setDescription] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createTrait({ name, category, trait_type, impact, description }, {
            onSuccess: () => onClose()
        })
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-2">
                <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Define New Trait</CardTitle>
                    <CardDescription>Add a new quality or weakness to your Personal Mirror.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Trait Name</label>
                            <input
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Deep Work Focus"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Category</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                >
                                    <option value="strength">Strength</option>
                                    <option value="weakness">Growth Area</option>
                                    <option value="disaster">💥 Disaster</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Type Domain</label>
                                <select
                                    className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                    value={trait_type}
                                    onChange={e => setTraitType(e.target.value as any)}
                                >
                                    <option value="general">General (Soft)</option>
                                    <option value="technical">Technical (Hard)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Impact Profile</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm focus:outline-none"
                                value={impact}
                                onChange={e => setImpact(parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}/5</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Description / Context</label>
                            <textarea
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm h-24 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Details about this trait..."
                            />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex gap-2">
                        <Button type="button" variant="outline" className="flex-1 font-bold" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1 font-bold">Initialize</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

function ReflectionModal({ traitId, onClose }: { traitId: string, onClose: () => void }) {
    const { data: traitDetail } = useTraitDetail(traitId)
    const { mutate: createAudit } = useCreateAudit()
    const [rating, setRating] = useState(3)
    const [summary, setSummary] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createAudit({ trait_id: traitId, rating, summary }, {
            onSuccess: () => onClose()
        })
    }

    if (!traitDetail) return null

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-2">
                <CardHeader>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Shadow Audit: {traitDetail.name}</CardTitle>
                    <CardDescription>Reflect on your recent performance regarding this trait.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground text-center block">Self-Assessment Rating</label>
                            <div className="flex justify-center gap-4 py-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setRating(v)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-2 ${rating === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border/50 hover:border-primary/50'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Reflection Summary</label>
                            <textarea
                                className="w-full bg-secondary/50 border border-border/50 rounded-md p-2 text-sm h-32 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                value={summary}
                                onChange={e => setSummary(e.target.value)}
                                placeholder="What happened recently? Why this rating?"
                                required
                            />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex gap-2">
                        <Button type="button" variant="outline" className="flex-1 font-bold" onClick={onClose}>Discard</Button>
                        <Button type="submit" className="flex-1 font-bold">Log Audit</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
