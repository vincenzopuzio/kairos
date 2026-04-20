import { useState } from "react"
import { useKnowledgeEntries, useKbMutations } from "@/hooks/useKnowledge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function EntryModal({ entry, onClose }: { entry: any | null; onClose: () => void }) {
    const { useCreate, useUpdate } = useKbMutations()
    const { mutateAsync: createEntry, isPending: creating } = useCreate()
    const { mutateAsync: updateEntry, isPending: updating } = useUpdate()

    const [title, setTitle] = useState(entry?.title ?? "")
    const [content, setContent] = useState(entry?.content ?? "")
    const [tags, setTags] = useState(entry?.tags ?? "")
    const [sourceUrl, setSourceUrl] = useState(entry?.source_url ?? "")

    const isEdit = !!entry?.id
    const isPending = creating || updating

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return
        if (isEdit) {
            await updateEntry({ id: entry.id, title, content, tags, source_url: sourceUrl || null })
        } else {
            await createEntry({ title, content, tags, source_url: sourceUrl || null })
        }
        onClose()
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit KB Entry" : "New Knowledge Entry"}</DialogTitle>
                        <DialogDescription>Capture a reusable piece of architectural knowledge, learning, or reference.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="FastAPI async patterns" autoFocus />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Content</label>
                            <textarea
                                className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono leading-relaxed"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Use async context managers when handling DB sessions in FastAPI. Always prefer AsyncSession over Session..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Tags (comma-separated)</label>
                                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="python,fastapi,architecture" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Source URL (optional)</label>
                                <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending || !title.trim() || !content.trim()}>
                            {isPending ? "Saving..." : isEdit ? "Update Entry" : "Add to KB"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function KnowledgeBaseView() {
    const [search, setSearch] = useState("")
    const [tagFilter, setTagFilter] = useState("")
    const [aiQuery, setAiQuery] = useState("")
    const [aiResult, setAiResult] = useState<any>(null)
    const [editingEntry, setEditingEntry] = useState<any | null>(null)
    const [showNewModal, setShowNewModal] = useState(false)

    const { data: entries, isLoading } = useKnowledgeEntries(
        search.length >= 2 ? search : undefined,
        tagFilter || undefined
    )
    const { useDelete, useAsk } = useKbMutations()
    const { mutateAsync: deleteEntry } = useDelete()
    const { mutateAsync: askKb, isPending: searching } = useAsk()

    const handleAsk = async () => {
        if (!aiQuery.trim()) return
        const result = await askKb(aiQuery)
        setAiResult(result)
    }

    const allTags: string[] = Array.from(new Set(
        (entries ?? []).flatMap((e: any) => e.tags ? e.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [])
    )) as string[]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-end justify-between border-b pb-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Knowledge Base</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wide">Personal Engineering Intelligence Layer</p>
                </div>
                <Button onClick={() => setShowNewModal(true)} className="font-bold shadow-md">
                    + New Entry
                </Button>
            </div>

            {/* AI Search Panel */}
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">🧠 Ask Your Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3">
                        <Input
                            className="flex-1 font-medium"
                            placeholder="How should I handle async sessions in FastAPI?"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                        />
                        <Button onClick={handleAsk} disabled={searching || !aiQuery.trim()} className="font-bold shrink-0">
                            {searching ? "Searching..." : "Ask AI"}
                        </Button>
                    </div>
                    {aiResult && (
                        <div className="space-y-3 pt-2 border-t border-primary/20">
                            <p className="text-sm font-medium leading-relaxed">{aiResult.answer}</p>
                            {aiResult.cited_entry_titles?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground self-center">Sources:</span>
                                    {aiResult.cited_entry_titles.map((t: string) => (
                                        <span key={t} className="text-xs bg-background border px-2 py-0.5 rounded font-semibold">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <Input
                    className="max-w-xs font-medium"
                    placeholder="Search entries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tags:</span>
                    <button
                        onClick={() => setTagFilter("")}
                        className={`text-xs px-2 py-1 rounded border font-semibold transition-colors ${!tagFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-secondary'}`}
                    >All</button>
                    {allTags.map((t: string) => (
                        <button
                            key={t}
                            onClick={() => setTagFilter(t === tagFilter ? "" : t)}
                            className={`text-xs px-2 py-1 rounded border font-semibold transition-colors ${tagFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-secondary'}`}
                        >{t}</button>
                    ))}
                </div>
            </div>

            {/* Entry list */}
            {isLoading && <div className="h-40 w-full bg-secondary animate-pulse rounded-xl" />}

            {!isLoading && (!entries || entries.length === 0) && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl bg-secondary/5">
                    <h3 className="text-xl font-bold mb-2">Knowledge Base is Empty</h3>
                    <p className="text-muted-foreground mb-4">Add your first entry to start building your personal engineering intelligence layer.</p>
                    <Button onClick={() => setShowNewModal(true)}>Add First Entry</Button>
                </div>
            )}

            {!isLoading && entries && entries.length > 0 && (
                <div className="grid gap-4">
                    {entries.map((e: any) => (
                        <Card key={e.id} className="group border border-border hover:border-primary/40 transition-colors shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-bold truncate">{e.title}</h3>
                                            {e.source_url && (
                                                <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary underline font-semibold shrink-0">source ↗</a>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">{e.content}</p>
                                        {e.tags && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {e.tags.split(",").filter(Boolean).map((t: string) => (
                                                    <span key={t} className="text-[10px] font-bold uppercase bg-secondary px-1.5 py-0.5 rounded border">{t.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button onClick={() => setEditingEntry(e)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                        </button>
                                        <button onClick={() => deleteEntry(e.id)} className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {(showNewModal || editingEntry) && (
                <EntryModal
                    entry={editingEntry}
                    onClose={() => { setShowNewModal(false); setEditingEntry(null); }}
                />
            )}
        </div>
    )
}
