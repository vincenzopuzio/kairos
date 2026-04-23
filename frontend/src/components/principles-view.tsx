import { useState } from "react"
import { usePrinciples } from "@/hooks/usePrinciples"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Search, Sparkles, CheckCircle2 } from "lucide-react"

export function PrinciplesView() {
    const { principles, isLoading, research, createPrinciple } = usePrinciples();
    const [searchQuery, setSearchQuery] = useState("");
    const [researchResults, setResearchResults] = useState<any>(null);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleResearch = async () => {
        if (!searchQuery) return;
        const result = await research.mutateAsync(searchQuery);
        setResearchResults(result);
        setSelectedIndexes(result.top_principles.map((_: any, i: number) => i)); // Default select all
    };

    const handleApprove = async () => {
        const toSave = researchResults.top_principles.filter((_: any, i: number) => selectedIndexes.includes(i));
        for (const p of toSave) {
            await createPrinciple.mutateAsync(p);
        }
        setIsDialogOpen(false);
    };

    const toggleSelection = (idx: number) => {
        setSelectedIndexes(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="h-10 w-64 bg-secondary animate-pulse rounded mb-8" />
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 w-full bg-secondary animate-pulse rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Guiding Principles</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Core AI-OS Mental Frameworks</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setSearchQuery("");
                        setResearchResults(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none">
                            <Search className="w-4 h-4" />
                            Research New Principles
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                AI Principle Researcher
                            </DialogTitle>
                            <DialogDescription>
                                Search for strategic frameworks, mental models, or survival strategies from across the web.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter topic (e.g. 'Surving big tech consulting', 'Deep work habits')..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                                />
                                <Button onClick={handleResearch} disabled={research.isPending || !searchQuery}>
                                    {research.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Research"}
                                </Button>
                            </div>

                            {researchResults && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" />
                                            Strategic Context
                                        </h4>
                                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                                            {researchResults.strategic_context}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex justify-between items-center">
                                            Proposed Adaptations
                                            <span className="text-[10px] lowercase font-normal italic">{selectedIndexes.length} selected</span>
                                        </h4>
                                        {researchResults.top_principles.map((p: any, idx: number) => (
                                            <Card
                                                key={idx}
                                                className={`transition-all duration-300 border shadow-none cursor-pointer group ${selectedIndexes.includes(idx)
                                                    ? "border-primary/40 bg-primary/10"
                                                    : "border-border/50 bg-background/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                                    }`}
                                                onClick={() => toggleSelection(idx)}
                                            >
                                                <CardHeader className="py-4 flex flex-row items-center gap-4 space-y-0">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedIndexes.includes(idx) ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                        }`}>
                                                        {selectedIndexes.includes(idx) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <CardTitle className="text-lg">{p.title}</CardTitle>
                                                        <CardDescription className="font-bold tracking-wider uppercase text-[10px]">{p.subtitle}</CardDescription>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="py-0 pb-4 space-y-3">
                                                    <p className="text-xs text-foreground/70 leading-relaxed">{p.description}</p>
                                                    <div className="bg-background/50 p-2 rounded border border-primary/10">
                                                        <span className="text-[11px] font-bold text-primary italic">"{p.actionable_advice}"</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        <div className="pt-6 border-t border-border/50 flex justify-end gap-3 sticky bottom-0 bg-background pb-2">
                                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={handleApprove}
                                                disabled={selectedIndexes.length === 0 || createPrinciple.isPending}
                                                className="px-8 font-bold"
                                            >
                                                {createPrinciple.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                Approve {selectedIndexes.length} Principles
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {principles.map((principle: any) => (
                    <Card key={principle.id} className="border-border bg-card shadow-sm hover:border-primary/30 transition-all relative overflow-hidden group min-h-[220px] flex flex-col">
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${principle.color === 'emerald' ? 'bg-emerald-500' :
                            principle.color === 'blue' ? 'bg-blue-500' :
                                principle.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl tracking-tight">
                                <div className={`p-2 rounded-lg ${principle.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                                    principle.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                        principle.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                {principle.title}
                            </CardTitle>
                            <CardDescription className="font-bold tracking-wider uppercase text-xs mt-2">
                                {principle.subtitle}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 flex-grow">
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                {principle.description}
                            </p>
                            <div className="rounded-md bg-secondary/50 p-4 text-sm border-l-4 border-primary/50 group-hover:border-primary transition-colors mt-auto">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-primary" />
                                    Execution Tactic
                                </span>
                                <span className="text-foreground/90 italic font-semibold text-[13px] leading-snug">"{principle.actionable_advice}"</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

