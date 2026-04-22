import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useLessonsLearned } from '@/hooks/useInteractions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    History,
    Users,
    TrendingUp,
    ChevronRight,
    Trophy,
    AlertCircle
} from 'lucide-react';
import { InteractionJournalView } from './interaction-journal-view';

export function StrategicJournalView() {
    const { data: stakeholders, isLoading: isLoadingStakeholders } = useStakeholders();
    const { data: lessons, isLoading: isLoadingLessons } = useLessonsLearned();
    const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null);
    const [showGlobalJournal, setShowGlobalJournal] = useState(false);

    if (selectedStakeholder || showGlobalJournal) {
        return (
            <InteractionJournalView
                stakeholder={selectedStakeholder}
                onBack={() => {
                    setSelectedStakeholder(null);
                    setShowGlobalJournal(false);
                }}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Strategic Journal</h1>
                    <p className="text-muted-foreground mt-2">Centralized relationship audit and professional dynamic coaching vault.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-amber-500/30 bg-amber-500/5 text-amber-500 font-bold">
                        <TrendingUp className="w-3 h-3 mr-1" /> Dynamics Active
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-secondary/40 p-1 border border-border/50">
                    <TabsTrigger value="overview" className="gap-2">
                        <Users className="w-4 h-4" /> Relationships
                    </TabsTrigger>
                    <TabsTrigger value="feed" className="gap-2">
                        <History className="w-4 h-4" /> Global Audit Feed
                    </TabsTrigger>
                    <TabsTrigger value="lessons" className="gap-2">
                        <Trophy className="w-4 h-4" /> Lessons Learned
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {isLoadingStakeholders ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-secondary animate-pulse rounded-xl" />)
                        ) : (
                            stakeholders?.map((st: any) => (
                                <Card
                                    key={st.id}
                                    className="group cursor-pointer hover:border-primary/40 transition-all bg-card/40 backdrop-blur-sm border-border/50 relative overflow-hidden"
                                    onClick={() => setSelectedStakeholder(st)}
                                >
                                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3 text-center">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{st.name}</CardTitle>
                                        <CardDescription>{st.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0 text-center pb-6">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest">{st.company}</Badge>
                                        </div>
                                        <Button variant="ghost" className="w-full text-xs font-bold gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                            Open Journal <ChevronRight className="w-3 h-3" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        {!isLoadingStakeholders && (!stakeholders || stakeholders.length === 0) && (
                            <Card className="col-span-full py-20 border-dashed bg-transparent flex flex-col items-center justify-center opacity-60">
                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                <CardTitle>No Relationships Mapped</CardTitle>
                                <CardDescription>Define your Teammate Personas first to start strategic journaling.</CardDescription>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="feed" className="space-y-6">
                    <InteractionJournalView
                        stakeholder={null}
                        onBack={() => { }}
                    />
                </TabsContent>

                <TabsContent value="lessons" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {isLoadingLessons ? (
                            [1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-xl" />)
                        ) : (
                            lessons?.map((lesson: string, idx: number) => (
                                <Card key={idx} className="bg-secondary/20 border-border/40 hover:border-primary/30 transition-all group">
                                    <CardContent className="p-5 flex gap-4">
                                        <div className="mt-1">
                                            <AlertCircle className="w-5 h-5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                                "{lesson}"
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        {!isLoadingLessons && (!lessons || lessons.length === 0) && (
                            <div className="col-span-full text-center py-20 opacity-40 italic">
                                No lessons recorded yet. Start journaling interactions to build your strategic vault.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
