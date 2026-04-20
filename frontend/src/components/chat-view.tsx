import { useState, useRef, useEffect } from "react"
import { useStrategicChat } from "@/hooks/useAI"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateTask, useUpdateTask, useCreateProject, useUpdateProject } from "@/hooks/useTasks"

interface Message {
    role: 'user' | 'assistant'
    content: string
    plan?: any[]
}

export function StrategicChatView() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "I am your Strategic Advisor. How can I help you optimize your AI-OS today?" }
    ])
    const chatMutation = useStrategicChat()
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const createProject = useCreateProject()
    const updateProject = useUpdateProject()

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || chatMutation.isPending) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")

        chatMutation.mutate({ message: input, history: messages.map(m => ({ role: m.role, content: m.content })) }, {
            onSuccess: (data) => {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message, plan: data.proposed_plan }])
            }
        })
    }

    const executeAction = (action: any) => {
        switch (action.action_type) {
            case 'CREATE_TASK':
                createTask.mutate(action.payload)
                break
            case 'UPDATE_TASK':
                updateTask.mutate(action.payload)
                break
            case 'CREATE_PROJECT':
                createProject.mutate(action.payload)
                break
            case 'UPDATE_PROJECT':
                updateProject.mutate(action.payload)
                break
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-card rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="p-6 border-b bg-secondary/20 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                        Strategic Advisor
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Grounded Reasoning Engine</p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${m.role === 'user'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-foreground border-border'
                            }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>

                            {m.plan && m.plan.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Proposed Plan for Approval:</p>
                                    {m.plan.map((action, ai) => (
                                        <Card key={ai} className="bg-background/80 border-dashed border-primary/30">
                                            <CardHeader className="p-3 pb-1">
                                                <CardTitle className="text-xs font-bold flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px]">{action.action_type}</span>
                                                    {action.payload.title || action.payload.name || "Modification"}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <p className="text-[10px] text-muted-foreground italic mb-2 line-clamp-2">{action.reasoning}</p>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 text-[10px] w-full font-bold uppercase transition-all hover:bg-primary hover:text-primary-foreground"
                                                    onClick={() => executeAction(action)}
                                                >
                                                    Execute Action
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {chatMutation.isPending && (
                    <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-2xl p-4 border border-border flex gap-1 items-center">
                            <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t bg-secondary/10">
                <div className="flex gap-2 relative">
                    <Input
                        placeholder="Ask for guidance or command a plan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="pr-24 h-12 rounded-xl focus-visible:ring-primary shadow-inner"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={chatMutation.isPending || !input.trim()}
                        className="absolute right-1.5 top-1.5 h-9 px-4 rounded-lg font-bold"
                    >
                        {chatMutation.isPending ? "Analysing..." : "Send"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
