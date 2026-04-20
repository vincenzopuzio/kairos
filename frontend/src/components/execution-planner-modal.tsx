import { useEffect } from "react"
import { useGeneratePlanner } from "@/hooks/useAI"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ExecutionPlannerModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const plannerMutation = useGeneratePlanner()

    // Auto-trigger deterministic generation whenever modal unlocks, if lacking data
    useEffect(() => {
        if (open && !plannerMutation.data && !plannerMutation.isPending && !plannerMutation.isError) {
            plannerMutation.mutate({ available_hours: 8, focus_slots_preferred: true })
        }
    }, [open, plannerMutation])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col p-6">
                <DialogHeader className="shrink-0 mb-2">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                        <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                        AI Execution Strategy
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mr-6">
                        Gemini orchestrating strict priority vectors guarding optimal Deep Work focus slots.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                    {plannerMutation.isPending && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-80">
                            <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                            <p className="text-sm font-bold tracking-[0.2em] uppercase text-amber-500">Synthesizing Critical Path ...</p>
                        </div>
                    )}

                    {plannerMutation.isError && (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 rounded-xl border border-destructive/30">
                            <p className="text-destructive font-bold text-lg mb-2">Systems Failure Detected</p>
                            <p className="text-muted-foreground text-sm">LLM gateway disconnected. Confirm GEMINI_API_KEY inside backend env mapping file.</p>
                            <button onClick={() => plannerMutation.mutate({ available_hours: 8 })} className="mt-6 px-4 py-2 bg-background border rounded-md font-semibold hover:bg-secondary">
                                Retry Orchestration
                            </button>
                        </div>
                    )}

                    {plannerMutation.data && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* Intelligent Insights Briefing */}
                            <div className="rounded-xl bg-secondary/60 p-5 text-sm border-l-4 border-amber-500 shadow-sm">
                                <p className="font-extrabold text-amber-500 mb-2 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    Morning Vector Briefing
                                </p>
                                <p className="text-foreground/90 font-medium leading-relaxed">{plannerMutation.data.insights}</p>
                                <p className="text-[10px] text-muted-foreground mt-4 font-bold tracking-wider uppercase text-right">
                                    Algorithmic Integrity: {(plannerMutation.data.confidence_score * 100).toFixed(0)}%
                                </p>
                            </div>

                            {/* Dynamic Timeline Generation */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl tracking-tight text-foreground">Timeline Sequence</h3>
                                    <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-secondary rounded-md">8 HOURS CAPACITY</span>
                                </div>
                                <div className="space-y-4">
                                    {plannerMutation.data.schedule.map((block: any, i: number) => (
                                        <div key={i} className="flex flex-col md:flex-row gap-4 p-5 rounded-xl border bg-card shadow-sm hover:border-foreground/20 transition-all relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="md:w-32 flex flex-col justify-center shrink-0">
                                                <span className="text-2xl font-extrabold tracking-tighter text-foreground">{block.time_start}</span>
                                                <span className="text-xs font-bold text-muted-foreground pt-1">{block.time_end}</span>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center border-l border-border/50 md:pl-5 relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider uppercase border
                              ${block.activity_type === 'deep_work' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            block.activity_type === 'meeting' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                                'bg-secondary text-muted-foreground'}`
                                                    }>
                                                        {block.activity_type.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-foreground/80 leading-relaxed">{block.reasoning}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
