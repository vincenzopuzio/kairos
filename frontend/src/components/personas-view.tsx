import { useStakeholders } from "@/hooks/useStakeholders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function PersonasView() {
    const { data: stakeholders, isLoading } = useStakeholders()

    const groupedStakeholders = stakeholders?.reduce((acc: any, st: any) => {
        const comp = st.company || "Unassigned"
        if (!acc[comp]) acc[comp] = []
        acc[comp].push(st)
        return acc
    }, {}) || {}

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8 border-b pb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Teammate Personas</h1>
                <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Multi-Vendor Scope</p>
            </div>

            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && Object.entries(groupedStakeholders).map(([company, orgStakeholders]: [string, any]) => (
                <div key={company} className="bg-background/40 border border-border/50 rounded-xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 to-transparent" />
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <span className="text-xl bg-primary/10 text-primary p-2 rounded-md">🏢</span>
                        {company}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {orgStakeholders.map((st: any) => (
                            <Card key={st.id} className="shadow-sm bg-background relative overflow-hidden group border-border hover:border-primary/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader>
                                    <CardTitle className="text-lg flex justify-between items-start">
                                        <span>{st.name}</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-secondary text-secondary-foreground rounded border shadow-sm">
                                            {st.interaction_type}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>{st.role}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                            <span className="text-muted-foreground block mb-1">Grade</span>
                                            <span className="font-semibold capitalize">{st.grade}</span>
                                        </div>
                                        <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                            <span className="text-muted-foreground block mb-1">Seniority</span>
                                            <span className="font-semibold capitalize">{st.seniority}</span>
                                        </div>
                                        <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                            <span className="text-muted-foreground block mb-1">Proact.</span>
                                            <span className="font-semibold capitalize">{st.proactivity}</span>
                                        </div>
                                        <div className="bg-secondary/40 rounded p-2 border border-border/50">
                                            <span className="text-muted-foreground block mb-1">Product.</span>
                                            <span className="font-semibold capitalize">{st.productivity}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        <strong className="text-foreground/80 block mb-1 text-[10px] uppercase tracking-wider">Core Skills</strong>
                                        <p className="text-primary font-mono text-[11px] font-bold">{st.skills || "N/A"}</p>
                                    </div>

                                    <p className="text-xs text-foreground/70 italic border-l-2 border-primary/40 pl-3 leading-relaxed">
                                        "{st.general_description || "Unassigned context."}"
                                    </p>

                                    {!st.can_delegate && (
                                        <div className="text-[10px] text-destructive font-bold uppercase tracking-wider flex items-center gap-1.5 pt-3 border-t mt-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                            Explicitly Blocked
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {!isLoading && (!stakeholders || stakeholders.length === 0) && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl mt-8 opacity-60">
                    <h3 className="text-xl font-bold mb-2">No Personas Defined</h3>
                    <p className="text-muted-foreground">Map your team architecture to leverage robust AI delegation features.</p>
                </div>
            )}
        </div>
    )
}
