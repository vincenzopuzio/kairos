import { usePrinciples } from "@/hooks/usePrinciples"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PrinciplesView() {
    const { principles, isLoading } = usePrinciples();

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
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Guiding Principles</h1>
                <p className="text-sm font-medium text-muted-foreground">Core AI-OS Mental Frameworks</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {principles.map((principle: any) => (
                    <Card key={principle.id} className="border-border bg-card shadow-sm hover:border-primary/30 transition-all relative overflow-hidden group">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                {principle.title}
                            </CardTitle>
                            <CardDescription className="font-bold tracking-wider uppercase text-xs mt-2">
                                {principle.subtitle}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                {principle.description}
                            </p>
                            <div className="rounded-md bg-secondary/50 p-4 text-sm border-l-4 border-primary/50 group-hover:border-primary transition-colors">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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

