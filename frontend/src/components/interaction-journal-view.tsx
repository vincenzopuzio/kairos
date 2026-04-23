import React, { useState } from 'react';
import { useInteractions, useInteractionMutations } from '@/hooks/useInteractions';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, History, BrainCircuit, Quote, Sparkles, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface InteractionJournalViewProps {
    stakeholder: any;
    onBack: () => void;
}

export function InteractionJournalView({ stakeholder, onBack }: InteractionJournalViewProps) {
    const { data: stakeholders } = useStakeholders();
    const { data: interactions, isLoading: isLoadingInteractions } = useInteractions(stakeholder?.id);
    const { create, getCoaching, remove } = useInteractionMutations(stakeholder?.id);

    const [newEntry, setNewEntry] = useState('');
    const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'tense' | 'hostile'>('neutral');
    const [lesson, setLesson] = useState('');
    const [stakeholderIds, setStakeholderIds] = useState<string[]>(stakeholder ? [stakeholder.id] : []);
    const [showForm, setShowForm] = useState(false);

    const [coachingResult, setCoachingResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await create.mutateAsync({
            stakeholder_ids: stakeholderIds,
            content: newEntry,
            sentiment,
            lesson_learned: lesson
        });
        setNewEntry('');
        setLesson('');
        if (!stakeholder) setStakeholderIds([]);
        setShowForm(false);
    };

    const handleRequestCoaching = async () => {
        if (!stakeholder) return;
        const result = await getCoaching.mutateAsync(stakeholder.id);
        setCoachingResult(result);
    };

    const toggleStakeholder = (id: string) => {
        setStakeholderIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getSentimentColor = (s: string) => {
        switch (s) {
            case 'positive': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'tense': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'hostile': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-secondary text-secondary-foreground border-transparent';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
                        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Personas
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        {stakeholder ? `Interaction Journal: ${stakeholder.name}` : "Strategic Audit Feed"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {stakeholder
                            ? `Strategic audit trail and relationship dynamics for ${stakeholder.role}.`
                            : "Unified timeline of all professional interactions and relationship shifts."
                        }
                    </p>
                </div>
                {stakeholder && (
                    <Button
                        onClick={handleRequestCoaching}
                        disabled={getCoaching.isPending}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none gap-2"
                    >
                        {getCoaching.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                        Get Strategic Advice
                    </Button>
                )}
            </div>

            {coachingResult && (
                <Card className="border-primary/30 bg-primary/5 shadow-2xl shadow-primary/5 animate-in zoom-in-95 duration-300">
                    <CardHeader className="border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Sparkles className="w-5 h-5" />
                            Workplace Strategic Advice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary/70 mb-2">Recommended Mindset</h4>
                                <Badge variant="outline" className="text-sm font-bold border-primary/30 bg-primary/10 px-3 py-1">
                                    {coachingResult.recommended_mindset}
                                </Badge>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary/70 mb-2 text-primary/70">Strategic Rationale</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                                    {coachingResult.strategic_rationale}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {coachingResult.immediate_actions.map((action: any, idx: number) => (
                                    <div key={idx} className="bg-background/60 border border-primary/10 rounded-xl p-4">
                                        <h5 className="text-xs font-bold text-foreground mb-1">{action.title}</h5>
                                        <p className="text-[11px] text-muted-foreground leading-normal">{action.description}</p>
                                    </div>
                                ))}
                            </div>

                            {coachingResult.suggested_response && (
                                <div className="mt-6 pt-6 border-t border-primary/10">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary/70 mb-3 block">Suggested Communication Link</h4>
                                    <div className="bg-black/20 rounded-xl p-4 font-mono text-[11px] text-primary relative group border border-primary/20">
                                        <Quote className="absolute -top-3 -left-2 w-6 h-6 text-primary/20" />
                                        {coachingResult.suggested_response}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Audit Timeline
                </h2>
                <Button
                    variant={showForm ? "ghost" : "default"}
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                    className="gap-2"
                >
                    {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Record Interaction</>}
                </Button>
            </div>

            {showForm && (
                <Card className="border-border/50 bg-secondary/20 animate-in slide-in-from-top-4">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interaction Context</label>
                                <Textarea
                                    placeholder="What happened during this interaction?"
                                    value={newEntry}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEntry(e.target.value)}
                                    className="min-h-[100px] bg-background"
                                    required
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dynamic Sentiment</label>
                                    <div className="flex gap-2">
                                        {['positive', 'neutral', 'tense', 'hostile'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setSentiment(s as any)}
                                                className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-md border transition-all ${sentiment === s
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                                                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Associated Personas</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-background rounded-md border border-border min-h-[50px]">
                                        {stakeholders?.map((st: any) => (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => toggleStakeholder(st.id)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${stakeholderIds.includes(st.id)
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-secondary/40 border-transparent text-muted-foreground hover:border-border'
                                                    }`}
                                            >
                                                {st.name}
                                            </button>
                                        ))}
                                        {(!stakeholders || stakeholders.length === 0) && (
                                            <span className="text-[10px] text-muted-foreground italic">No personas available</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lesson Learned</label>
                                <Input
                                    placeholder="What did this reveal about the dynamic?"
                                    value={lesson}
                                    onChange={(e) => setLesson(e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={create.isPending} className="px-8 font-bold">
                                    {create.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Commit to Journal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/40" />

                {isLoadingInteractions ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-24 w-full bg-secondary animate-pulse rounded-xl" />)}
                    </div>
                ) : interactions?.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-secondary/10 opacity-60">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold">No interactions recorded.</h3>
                        <p className="text-sm text-muted-foreground">
                            {stakeholder
                                ? `Start journaling your strategic dynamics with ${stakeholder.name}.`
                                : "Start recording your strategic dynamics and professional lessons learned."
                            }
                        </p>
                    </div>
                ) : (
                    interactions?.map((it: any) => (
                        <div key={it.id} className="relative pl-12 group">
                            {/* Timeline Node */}
                            <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center p-2 z-10 transition-transform group-hover:scale-110 ${getSentimentColor(it.sentiment)}`}>
                                <MessageSquare className="w-4 h-4" />
                            </div>

                            <Card className="group-hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md bg-card/60 backdrop-blur-sm">
                                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0 border-b border-border/10">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={`font-black tracking-[0.1em] text-[8px] uppercase px-1.5 py-0.5 ${getSentimentColor(it.sentiment)}`}>
                                            {it.sentiment}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            {format(new Date(it.created_at), 'PPPp')}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 items-center">
                                        {it.stakeholders?.map((st: any) => (
                                            <Badge key={st.id} variant="secondary" className="text-[8px] bg-secondary/50 border-none font-medium">
                                                {st.name}
                                            </Badge>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => remove.mutate(it.id)}
                                            disabled={remove.isPending}
                                        >
                                            {remove.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {it.content}
                                    </p>

                                    {it.lesson_learned && (
                                        <div className="pt-4 border-t border-border/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                                                <History className="w-3 h-3" />
                                                Lesson Learned
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium bg-secondary/30 rounded-lg p-3 border border-border/20">
                                                {it.lesson_learned}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
