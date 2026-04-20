import { useState } from "react"
import { useGenerateQuarterlyPlanner } from "@/hooks/useAI"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function MidTermHorizonView() {
    const { mutateAsync: generateQuarterly, isPending } = useGenerateQuarterlyPlanner()
    const [result, setResult] = useState<any>(null)

    const handleGenerate = async () => {
        try {
            const data = await generateQuarterly()
            setResult(data)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex items-end justify-between border-b pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Mid-Term Horizon</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wide">1/6 Months Strategic Project Roadmap</p>
                </div>
            </div>

            <div className="flex justify-center border-y py-6 bg-secondary/10">
                <Button size="lg" onClick={handleGenerate} disabled={isPending} className="font-black text-xl px-12 h-16 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    {isPending ? "Calculating Strategic Risk..." : "🚀 Generate Mid-Term Roadmap"}
                </Button>
            </div>

            {result && (
                <div className="space-y-6">
                    <Card className="border-2 border-primary/40 shadow-sm bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-xl flex gap-2"><span className="text-primary">⚠️</span> Overall Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium leading-relaxed">{result.overall_risk_assessment}</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {result.months.map((m: any, idx: number) => (
                            <Card key={idx} className="shadow-sm border-border relative overflow-hidden group">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                                <CardHeader className="bg-secondary/20 py-4 border-b border-border/50">
                                    <CardTitle className="text-2xl text-center font-black uppercase tracking-widest">{m.month_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 relative">
                                    <div className="bg-background/60 p-3 rounded border shadow-inner">
                                        <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Key Deliverables</span>
                                        <p className="text-sm font-semibold">{m.milestone_summary}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="block text-[10px] uppercase font-bold text-muted-foreground">Focal Projects</span>
                                        <div className="flex flex-col gap-2">
                                            {m.focal_projects.map((p: string, i: number) => (
                                                <span key={i} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1.5 rounded border border-primary/20">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
