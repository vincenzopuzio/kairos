import { useTimeline } from "@/hooks/useTimeline"
import { Card, CardContent } from "@/components/ui/card"
import { format, isPast } from "date-fns"

export function RoadmapView() {
    const { data: timelineItems, isLoading } = useTimeline()

    if (isLoading) {
        return <div className="h-64 w-full bg-secondary animate-pulse rounded-xl" />
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col mb-12 border-b pb-6">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Global Roadmap <span className="text-primary font-mono text-sm align-top">V1.0</span></h1>
                <p className="text-muted-foreground font-medium mt-2">Unified chronological tracking of all Strategic, Project, and Task horizons.</p>
            </div>

            {!timelineItems || timelineItems.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-xl opacity-60">
                    <h3 className="text-xl font-bold mb-2">No Looming Deadlines</h3>
                    <p className="text-muted-foreground">Your architectural horizon is entirely clear.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-border/60 pl-8 ml-4 space-y-10 py-6">
                    {timelineItems.map((item: any, idx: number) => {
                        const targetDate = new Date(item.deadline);
                        const isOverdue = isPast(targetDate);

                        return (
                            <div key={`${item.id}-${idx}`} className="relative group">
                                {/* Timeline Node Indicator */}
                                <div className={`absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-4 border-background outline outline-2 outline-border group-hover:scale-125 transition-transform ${isOverdue ? 'bg-destructive outline-destructive' : 'bg-primary outline-primary/40'}`} />

                                <Card className={`shadow-sm transition-all hover:shadow-md ${isOverdue ? 'border-destructive/40 bg-destructive/5' : 'border-border'}`}>
                                    <CardContent className="p-5 flex items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className={`text-lg font-bold leading-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                                                    {item.title}
                                                </h3>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm border ${item.entity_type === 'project' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/30'}`}>
                                                    {item.entity_type}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                                    <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
                                                        {format(targetDate, "MMM do, yyyy")}
                                                    </span>
                                                </div>
                                                {item.status && (
                                                    <div className="uppercase tracking-wider">
                                                        Status: {item.status.replace("_", " ")}
                                                    </div>
                                                )}
                                                {item.priority && (
                                                    <div>P{item.priority}</div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
