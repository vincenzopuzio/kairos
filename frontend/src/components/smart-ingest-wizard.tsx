import { useState } from "react"
import { useProjects, useIngestTasks, useCreateTask } from "@/hooks/useTasks"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SmartIngestWizard() {
    const { data: projects } = useProjects();
    const { mutateAsync: ingest, isPending: isIngesting } = useIngestTasks();
    const { mutateAsync: createTask } = useCreateTask();

    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [text, setText] = useState("");
    const [results, setResults] = useState<any>(null);
    const [selectedTasks, setSelectedTasks] = useState<Record<number, boolean>>({});
    const [assignedProjects, setAssignedProjects] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleIngest = async () => {
        if (!text.trim()) return;
        const res = await ingest(text);
        setResults(res);

        // Initialize selection and project mapping
        const initialSelected: Record<number, boolean> = {};
        const initialProjects: Record<number, string> = {};
        res.tasks.forEach((task: any, index: number) => {
            initialSelected[index] = true;
            if (task.suggested_project_id) {
                initialProjects[index] = task.suggested_project_id;
            }
        });

        setSelectedTasks(initialSelected);
        setAssignedProjects(initialProjects);
        setStep('review');
    };

    const handleImport = async () => {
        setIsSaving(true);
        const tasksToCreate = results.tasks.filter((_: any, i: number) => selectedTasks[i]);

        for (const task of tasksToCreate) {
            const resultIndex = results.tasks.indexOf(task);
            await createTask({
                title: task.title,
                description: task.description,
                priority: task.priority,
                importance: task.importance,
                urgency: task.urgency,
                is_frog: task.is_frog,
                project_id: assignedProjects[resultIndex] || null,
            });
        }

        setIsSaving(false);
        setOpen(false);
        // Reset state
        setStep('input');
        setText("");
        setResults(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2 font-black uppercase tracking-tighter">
                    <Sparkles className="w-4 h-4 text-primary" /> Smart Ingest
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-2 shadow-2xl">
                <DialogHeader className="p-6 bg-secondary/30 border-b relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3 relative">
                        <Sparkles className="w-6 h-6 text-primary" /> GenAI Task Ingestor
                    </DialogTitle>
                    <DialogDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest relative">
                        Convert unstructured signal into atomic KairOS execution nodes.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'input' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Raw Unstructured Signal</label>
                                <Textarea
                                    placeholder="Paste meeting notes, Slack threads, or brain-dump here..."
                                    className="min-h-[300px] font-mono text-sm leading-relaxed border-2 focus-visible:ring-primary h-full transition-all"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleIngest}
                                disabled={isIngesting || !text.trim()}
                                className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 shadow-lg hover:scale-[1.01] transition-all"
                            >
                                {isIngesting ? <Loader2 className="animate-spin w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                {isIngesting ? "Extracting Signal..." : "Extract Action Items"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-1">AI Strategic Summary</h3>
                                <p className="text-xs font-medium text-foreground/80 italic">{results?.summary}</p>
                            </div>

                            <div className="space-y-3">
                                {results?.tasks.map((task: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`group p-4 rounded-xl border-2 transition-all ${selectedTasks[index] ? 'bg-card border-primary/40 shadow-md ring-1 ring-primary/10' : 'bg-muted/20 border-transparent opacity-60'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTasks[index]}
                                                onChange={() => setSelectedTasks(prev => ({ ...prev, [index]: !prev[index] }))}
                                                className="mt-1.5 w-5 h-5 accent-primary cursor-pointer shrink-0"
                                            />
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight leading-tight">{task.title}</h4>
                                                        {task.description && <p className="text-[11px] text-muted-foreground mt-1 font-medium italic">{task.description}</p>}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <Badge variant="outline" className={`font-mono text-[9px] ${task.priority <= 2 ? 'border-destructive/40 text-destructive' : 'border-primary/40 text-primary'}`}>
                                                            P{task.priority}
                                                        </Badge>
                                                        {task.is_frog && <span title="The Frog">🐸</span>}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 pt-2 border-t border-dashed">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 shrink-0">Map to Project:</span>
                                                        <select
                                                            className="flex-1 bg-background border rounded px-2 py-1 text-[11px] font-bold focus:ring-1 focus:ring-primary"
                                                            value={assignedProjects[index] || ""}
                                                            onChange={(e) => setAssignedProjects(prev => ({ ...prev, [index]: e.target.value }))}
                                                        >
                                                            <option value="">[ ORPHAN - No Project ]</option>
                                                            {projects?.map((p: any) => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-secondary/50 px-2 py-1.5 rounded text-[10px] font-medium text-muted-foreground italic">
                                                        <AlertCircle className="w-3 h-3 text-primary shrink-0" />
                                                        {task.reasoning}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-background/80 backdrop-blur pb-2">
                                <Button variant="outline" onClick={() => setStep('input')} className="flex-1 font-bold">Back to Signal</Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={isSaving || !Object.values(selectedTasks).some(v => v)}
                                    className="flex-1 font-black uppercase tracking-widest gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isSaving ? "Locking Nodes..." : `Confirm & Import ${Object.values(selectedTasks).filter(v => v).length} Tasks`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
