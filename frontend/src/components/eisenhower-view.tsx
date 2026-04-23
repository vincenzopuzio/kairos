import { useMemo } from "react"
import { useTasks, useUpdateTask } from "@/hooks/useTasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Zap, Trash2 } from "lucide-react"

export function EisenhowerView() {
    const { data: tasks, isLoading } = useTasks()

    const quadrants = useMemo(() => {
        if (!tasks) return { q1: [], q2: [], q3: [], q4: [] }

        // Only include non-done tasks in the matrix
        const activeTasks = tasks.filter((t: any) => t.status !== 'done' && t.status !== 'archived')

        return {
            q1: activeTasks.filter((t: any) => (t.importance || 2) >= 2 && (t.urgency || 2) >= 2), // Important & Urgent
            q2: activeTasks.filter((t: any) => (t.importance || 2) >= 2 && (t.urgency || 2) < 2),  // Important & Not Urgent
            q3: activeTasks.filter((t: any) => (t.importance || 2) < 2 && (t.urgency || 2) >= 2),  // Not Important & Urgent
            q4: activeTasks.filter((t: any) => (t.importance || 2) < 2 && (t.urgency || 2) < 2),   // Not Important & Not Urgent
        }
    }, [tasks])

    const paretoTasks = useMemo(() => {
        if (!tasks) return []
        // Pareto: Top 20% by impact. We'll use Importance as the proxy.
        // Sort by importance descending, then urgency.
        return [...tasks]
            .filter((t: any) => t.status !== 'done')
            .sort((a: any, b: any) => {
                if (b.importance !== a.importance) return b.importance - a.importance
                return b.urgency - a.urgency
            })
            .slice(0, Math.max(1, Math.ceil(tasks.length * 0.2)))
    }, [tasks])

    if (isLoading) return <div className="h-64 flex items-center justify-center font-mono opacity-50 text-xs">RESOURCES_LOADING...</div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Decision Matrix</h1>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Prioritization Engine / Eisenhower & Pareto
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Q1: Do First */}
                <Card className="border-2 border-destructive/30 bg-destructive/5 overflow-hidden">
                    <CardHeader className="bg-destructive/10 border-b border-destructive/20 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Q1: Urgent & Important
                            </CardTitle>
                            <Badge variant="destructive" className="font-mono text-[10px]">DO_IMMEDIATELY</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 min-h-[160px]">
                        {quadrants.q1.map((t: any) => (
                            <TaskItem key={t.id} task={t} color="destructive" />
                        ))}
                    </CardContent>
                </Card>

                {/* Q2: Schedule */}
                <Card className="border-2 border-primary/30 bg-primary/5 overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/20 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Q2: Not Urgent & Important
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary">STRATEGIC_PLAN</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 min-h-[160px]">
                        {quadrants.q2.map((t: any) => (
                            <TaskItem key={t.id} task={t} color="primary" />
                        ))}
                    </CardContent>
                </Card>

                {/* Q3: Delegate */}
                <Card className="border-2 border-amber-500/30 bg-amber-500/5 overflow-hidden">
                    <CardHeader className="bg-amber-500/10 border-b border-amber-500/20 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Q3: Urgent & Not Important
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-[10px] border-amber-500/40 text-amber-600">DELEGATE_OR_LIMIT</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 min-h-[160px]">
                        {quadrants.q3.map((t: any) => (
                            <TaskItem key={t.id} task={t} color="amber" />
                        ))}
                    </CardContent>
                </Card>

                {/* Q4: Eliminate */}
                <Card className="border-2 border-muted/30 bg-muted/5 overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b border-muted/20 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Q4: Not Urgent & Not Important
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-[10px] border-muted/40 text-muted-foreground">ELIMINATE_DISTRACTIONS</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 min-h-[160px]">
                        {quadrants.q4.map((t: any) => (
                            <TaskItem key={t.id} task={t} color="muted" />
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Pareto Section */}
            <div className="pt-8 border-t border-dashed border-border/80">
                <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="text-primary tracking-tighter">80/20</span> PARETO OPTIMIZATION
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
                        The 20% of effort that generates 80% of your progress.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paretoTasks.map((t: any) => (
                        <div key={t.id} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Card className="relative bg-background border-2 border-primary/20 group-hover:border-primary/40 transition-all">
                                <CardContent className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">HIGH_IMPACT_NODE</Badge>
                                        <div className="flex gap-1 shrink-0">
                                            {t.is_frog && <span className="animate-bounce" title="The Frog">🐸</span>}
                                            {t.is_deep_work && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-lg leading-tight uppercase tracking-tight">{t.title}</h3>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{String(t.id).slice(0, 8)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">IMPACT_RATIO:</span>
                                            <span className="text-[11px] font-black text-primary">{(t.importance || 1) * 33}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                    {paretoTasks.length === 0 && (
                        <div className="col-span-full h-32 flex items-center justify-center rounded-xl border-2 border-dashed border-border opacity-50">
                            <p className="text-xs font-black uppercase tracking-widest">No high-impact nodes detected in the current matrix.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function TaskItem({ task, color }: { task: any, color: string }) {
    const updateTask = useUpdateTask()

    return (
        <div className={`p-2.5 rounded-lg border bg-background group hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
            onClick={() => { /* Open edit modal? */ }}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${color === 'destructive' ? 'bg-destructive' :
                color === 'primary' ? 'bg-primary' :
                    color === 'amber' ? 'bg-amber-500' : 'bg-muted-foreground'
                }`} />

            <div className="flex flex-col gap-1.5 pl-2">
                <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-black leading-tight uppercase tracking-tight line-clamp-2">{task.title}</span>
                    <div className="flex gap-1 shrink-0">
                        {task.is_frog && <span className="text-xs" title="The Frog">🐸</span>}
                        {task.is_deep_work && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mt-1" />}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 tracking-tighter font-mono">IMP:{task.importance || 2} / URG:{task.urgency || 2}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            updateTask.mutate({ id: task.id, status: 'done' })
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-500/10 rounded-full transition-all text-emerald-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
