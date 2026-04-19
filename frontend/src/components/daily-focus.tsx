import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTasks } from "@/hooks/useTasks"

export function DailyFocus() {
    const { data: tasks, isLoading } = useTasks(true)

    // Systematically isolate a single high precedence task optimized for deep work
    const deepWorkTask = tasks?.find((t: any) => t.is_deep_work && (t.status === 'in_progress' || t.status === 'todo'))

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daily Focus</h1>
                <p className="text-sm font-medium text-muted-foreground">Today's computed critical path</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Core Deep Work Execution Module */}
                <Card className="col-span-2 border-primary/50 bg-primary/5 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-50" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <span className={`h-2 w-2 rounded-full ${deepWorkTask ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground'}`} />
                            Active Deep Work
                        </CardTitle>
                        <CardDescription className="text-foreground/70">
                            {deepWorkTask ? 'Currently executing high priority architectural analysis.' : 'No deep work slots are heavily prioritized right now.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {isLoading ? (
                            <div className="h-8 w-3/4 bg-secondary animate-pulse rounded mb-5" />
                        ) : (
                            <div className="text-2xl font-bold mb-5 tracking-tight text-foreground">
                                {deepWorkTask?.title || "No pending Deep Work Tasks"}
                            </div>
                        )}
                        <div className="flex gap-4">
                            <Button disabled={!deepWorkTask || isLoading}>Complete Task</Button>
                            <Button disabled={!deepWorkTask || isLoading} variant="outline" className="border-border hover:bg-secondary">
                                Delegate (Shadow Task)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insight Module */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>AI Briefing</CardTitle>
                        <CardDescription>Morning Insights</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-secondary/80 p-4 text-sm border-l-4 border-amber-500 shadow-sm relative overflow-hidden">
                            <p className="font-bold text-amber-500 mb-1 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/0000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                Risk Detected
                            </p>
                            <p className="text-muted-foreground relative z-10 pt-1 font-medium leading-relaxed">
                                "The API Gateway Epic is blocked waiting for Developer X. Consider escalating immediately."
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4 tracking-tight">Upcoming Tasks</h2>
                <div className="space-y-3">
                    {isLoading && (
                        <div className="h-12 w-full bg-secondary animate-pulse rounded-xl" />
                    )}
                    {!isLoading && tasks?.filter((t: any) => !t.is_deep_work && t.status !== 'done').slice(0, 3).map((task: any, index: number) => (
                        <div key={task.id || index} className="flex items-center p-4 border rounded-xl bg-card hover:border-foreground/20 transition-colors shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1 font-semibold text-foreground">{task.title}</div>
                            <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-secondary-foreground border">
                                Priority {task.priority}
                            </div>
                        </div>
                    ))}
                    {!isLoading && (!tasks || tasks.length === 0) && (
                        <div className="text-sm text-muted-foreground italic pl-2">Your agenda is clear for now. No pending tasks!</div>
                    )}
                </div>
            </div>
        </div>
    )
}
