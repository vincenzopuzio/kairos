import { useState, useEffect } from "react"
import { useStrategicGoals, useUpdateStrategicGoal } from "@/hooks/useStrategicGoals"
import { useOsSettings } from "@/hooks/useSettings"
import { useGenerateWeeklyPlanner } from "@/hooks/useAI"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function WeeklyHorizonView() {
    const { data: goals, isLoading: goalsLoading } = useStrategicGoals()
    const { data: settings, isLoading: settingsLoading } = useOsSettings()

    const [overrides, setOverrides] = useState<any>({})
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const { mutateAsync: generateWeeklyPlan, isPending } = useGenerateWeeklyPlanner()
    const { mutate: updateGoal } = useUpdateStrategicGoal()
    const [planResult, setPlanResult] = useState<any>(null)

    useEffect(() => {
        if (settings) {
            setOverrides(settings)
        }
    }, [settings])

    const handleChange = (field: string, value: any) => {
        setOverrides((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleGenerate = async () => {
        try {
            // We pass the volatile overrides specifically for this execution context
            const result = await generateWeeklyPlan(overrides)
            setPlanResult(result)
        } catch (err) {
            console.error("Failed", err)
        }
    }

    const isLoading = goalsLoading || settingsLoading

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex items-end justify-between border-b pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Weekly Horizon</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wide">Strategic Orchestration & Context Overrides</p>
                </div>
            </div>

            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && (
                <>
                    <Card className="border-2 border-primary/20 shadow-sm bg-primary/5">
                        <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => setIsPanelOpen(!isPanelOpen)}>
                            <CardTitle className="text-xl flex justify-between items-center">
                                <span>🛠️ Volatile Execution Context (This Week Only)</span>
                                <span className="text-sm border px-2 py-1 bg-background rounded shadow-sm">{isPanelOpen ? "Minimize" : "Configure Overrides"}</span>
                            </CardTitle>
                        </CardHeader>
                        {isPanelOpen && (
                            <CardContent className="space-y-6 pt-4 border-t border-primary/10">
                                <p className="text-xs text-muted-foreground">Adjust limits safely. These overrides apply strictly to the incoming generation request without polluting your OS Blueprint Settings.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Weekly Combined Hours</label>
                                        <Input type="number" value={overrides.max_weekly_combined_hours || ""} onChange={(e) => handleChange("max_weekly_combined_hours", parseInt(e.target.value))} className="font-bold border-amber-500/50" />
                                    </div>
                                    <div className="space-y-1 pl-4 flex items-end">
                                        <p className="text-xs italic text-amber-600 font-medium">Use this to easily simulate shortened weeks (ex. PTO / Holidays).</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider border-b pb-1">Day Templates Volatility</h3>
                                    <datalist id="day-templates">
                                        {['Focus & Planning', 'Deep Work', 'Meetings & Code Reviews', 'Wrapping Up & Learning', 'Offline', 'Client Delivery', 'Code Refactoring'].map(t => (
                                            <option key={t} value={t} />
                                        ))}
                                    </datalist>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                            <div key={day} className="flex flex-col gap-1 bg-background/60 p-2 rounded border">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground text-center">{day}</label>
                                                <Input list="day-templates" className="text-xs h-8 text-center" value={overrides[`day_template_${day}`] || ""} onChange={(e) => handleChange(`day_template_${day}`, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <div className="flex justify-center border-y py-6 bg-secondary/10">
                        <Button size="lg" onClick={handleGenerate} disabled={isPending} className="font-black text-xl px-12 h-16 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                            {isPending ? "Orchestrating..." : "✨ Generate AI Weekly Plan ✨"}
                        </Button>
                    </div>

                    {planResult && (
                        <div className="space-y-6">
                            <Card className="border-2 border-primary/40 shadow-sm bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-xl flex gap-2"><span className="text-primary">🛡️</span> Strategic Protection Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium">{planResult.strategic_protection_summary}</p>
                                    <div className="mt-4 pt-4 border-t border-primary/20">
                                        <strong className="text-xs uppercase tracking-wider block mb-1 text-primary">Delegation Strategy</strong>
                                        <p className="text-sm italic">{planResult.delegation_strategy}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {planResult.days.map((day: any, idx: number) => (
                                    <Card key={idx} className="shadow-sm border-border relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardHeader className="bg-secondary/30 py-3 border-b border-border/50">
                                            <CardTitle className="text-lg text-center font-black uppercase tracking-widest">{day.day_name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4 relative">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col items-center justify-center bg-primary/10 p-2 rounded border border-primary/20">
                                                    <span className="text-[10px] uppercase font-bold text-primary mb-1">Strategic</span>
                                                    <span className="text-xl font-black text-primary">{day.strategic_hours_allocated}h</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center bg-background p-2 rounded border">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Operational</span>
                                                    <span className="text-xl font-black">{day.operational_hours_allocated}h</span>
                                                </div>
                                            </div>
                                            <div className="bg-background/60 p-3 rounded border shadow-inner">
                                                <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Architectural Reasoning</span>
                                                <p className="text-xs leading-relaxed italic text-foreground/80">"{day.reasoning}"</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {!planResult && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="col-span-full mb-2">
                                <h3 className="text-lg font-bold border-b pb-2">Strategic Goal Capacities</h3>
                            </div>
                            {goals?.map((g: any) => {
                                return (
                                    <Card key={g.id} className={`shadow-sm border-l-4 ${g.is_active ? 'border-primary bg-primary/5' : 'border-border opacity-50'}`}>
                                        <CardHeader className="py-4 pb-2">
                                            <CardTitle className="text-lg flex justify-between items-center">
                                                <span className="leading-tight">{g.title}</span>
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-background rounded border">{g.category}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="bg-background rounded p-2 border flex items-center justify-between shadow-inner">
                                                <span className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Weekly Bound</span>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateGoal({ id: g.id, target_weekly_hours: Math.max(0, g.target_weekly_hours - 1) })}>-</Button>
                                                    <span className="text-xl font-black text-primary">{g.target_weekly_hours}h</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateGoal({ id: g.id, target_weekly_hours: g.target_weekly_hours + 1 })}>+</Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-background/80 rounded p-1.5 border flex flex-col items-center">
                                                    <span className="text-[9px] uppercase text-muted-foreground font-bold">Min Days</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <button className="text-xs hover:text-primary" onClick={() => updateGoal({ id: g.id, min_days_per_week: Math.max(1, g.min_days_per_week - 1) })}>-</button>
                                                        <span className="text-sm font-black">{g.min_days_per_week}d</span>
                                                        <button className="text-xs hover:text-primary" onClick={() => updateGoal({ id: g.id, min_days_per_week: Math.min(7, g.min_days_per_week + 1) })}>+</button>
                                                    </div>
                                                </div>
                                                <div className="bg-background/80 rounded p-1.5 border flex flex-col items-center">
                                                    <span className="text-[9px] uppercase text-muted-foreground font-bold">Block Size</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <button className="text-xs hover:text-primary" onClick={() => updateGoal({ id: g.id, slot_duration_minutes: Math.max(15, g.slot_duration_minutes - 15) })}>-</button>
                                                        <span className="text-sm font-black">{g.slot_duration_minutes}m</span>
                                                        <button className="text-xs hover:text-primary" onClick={() => updateGoal({ id: g.id, slot_duration_minutes: g.slot_duration_minutes + 15 })}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
