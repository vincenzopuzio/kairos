import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTasks, useUpdateTask } from "@/hooks/useTasks"
import { EditTaskModal } from "./edit-task-modal"

export function DailyFocus() {
    const { data: tasks, isLoading } = useTasks(true)
    const updateTaskMutation = useUpdateTask()
    const [taskToEdit, setTaskToEdit] = useState<any>(null)

    // Identify the "Frog" - the most critical task today
    const frogTask = tasks?.find((t: any) => t.is_frog && t.status !== 'done')
    const deepWorkTask = tasks?.find((t: any) => t.is_deep_work && !t.is_frog && (t.status === 'in_progress' || t.status === 'todo'))

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Native Isolated Modification Modal injected here */}
            <EditTaskModal
                task={taskToEdit}
                open={!!taskToEdit}
                onOpenChange={(open) => !open && setTaskToEdit(null)}
            />

            <div className="flex items-end justify-between mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daily Focus</h1>
                <p className="text-sm font-medium text-muted-foreground">Today's computed critical path</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* THE FROG Component - Primary Goal */}
                {frogTask && (
                    <Card className="col-span-1 border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden group border-2">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-50" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="flex items-center gap-2 text-emerald-600 uppercase italic tracking-tighter">
                                <span className="text-2xl animate-bounce">🐸</span> Eat That Frog!
                            </CardTitle>
                            <CardDescription className="text-emerald-700/70 font-bold text-[10px] uppercase tracking-widest">
                                Most Critical Task of the Rotation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <h3 className="text-xl font-black mb-4 tracking-tight text-foreground line-clamp-2">
                                {frogTask.title}
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 text-xs"
                                    onClick={() => updateTaskMutation.mutate({ id: frogTask.id, status: 'done' })}
                                >
                                    Done
                                </Button>
                                <Button variant="ghost" className="h-8 px-3 text-xs opacity-60 hover:opacity-100" onClick={() => setTaskToEdit(frogTask)}>
                                    Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Core Deep Work Execution Module */}
                <Card className={`${frogTask ? 'col-span-1 lg:col-span-2' : 'col-span-full lg:col-span-2'} border-primary/50 bg-primary/5 shadow-md relative overflow-hidden`}>
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
                            <Button
                                disabled={!deepWorkTask || updateTaskMutation.isPending}
                                onClick={() => updateTaskMutation.mutate({ id: deepWorkTask.id, status: 'done' })}
                            >
                                {updateTaskMutation.isPending ? "Executing..." : "Complete Task"}
                            </Button>
                            <Button disabled={!deepWorkTask} variant="outline" className="border-border hover:bg-secondary" onClick={() => setTaskToEdit(deepWorkTask)}>
                                Modify Properties
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
                <h2 className="text-xl font-bold mb-4 tracking-tight">Upcoming Tasks Matrices</h2>
                <div className="space-y-3">
                    {isLoading && (
                        <div className="h-12 w-full bg-secondary animate-pulse rounded-xl" />
                    )}
                    {!isLoading && tasks?.filter((t: any) => t.id !== deepWorkTask?.id && t.status !== 'done').slice(0, 5).map((task: any, index: number) => (
                        <div key={task.id || index} className="flex items-center p-4 border rounded-xl bg-card hover:border-foreground/20 transition-colors shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1 font-semibold text-foreground relative z-10 flex items-center gap-2">
                                {task.is_deep_work && <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Deep Work Module" />}
                                {task.title}
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border text-secondary-foreground
                                    ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary'}`}>
                                    {task.status}
                                </div>
                                <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-secondary-foreground border">
                                    Priority {task.priority}
                                </div>
                                <button onClick={() => setTaskToEdit(task)} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-all group-hover:opacity-100 opacity-40 ml-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                </button>
                                <button onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'done' })} className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-500 transition-all group-hover:opacity-100 opacity-40">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    {!isLoading && (!tasks || tasks.filter((t: any) => !t.is_deep_work && t.status !== 'done').length === 0) && (
                        <div className="text-sm text-muted-foreground italic pl-2">Your agenda is clear for now. No pending tasks!</div>
                    )}
                </div>
            </div>
        </div>
    )
}
