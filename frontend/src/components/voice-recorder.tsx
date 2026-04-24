import { useState, useRef } from "react"
import { Mic, Square, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateTask } from "@/hooks/useTasks"

export function VoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const createMutation = useCreateTask()

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            chunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setResult(null)
        } catch (err) {
            console.error("Failed to start recording", err)
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
    }

    const transcribeAudio = async () => {
        if (!audioBlob) return
        setIsTranscribing(true)

        const formData = new FormData()
        formData.append("file", audioBlob, "recording.webm")

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/audio/transcribe`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (!response.ok) throw new Error("Transcription failed")
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsTranscribing(false)
        }
    }

    const importTask = (task: any) => {
        createMutation.mutate({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: 'todo'
        })
    }

    const reset = () => {
        setAudioBlob(null)
        setAudioUrl(null)
        setResult(null)
    }

    return (
        <Card className="max-w-2xl mx-auto border-dashed border-2 bg-secondary/10">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    Strategic Audio Ingestor
                </CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Mobile Voice-to-Task Transcription</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-8 gap-6">
                    {!audioUrl ? (
                        <Button
                            size="lg"
                            variant={isRecording ? "destructive" : "outline"}
                            className={`h-24 w-24 rounded-full transition-all duration-500 shadow-xl ${isRecording ? 'scale-110 animate-pulse' : 'hover:scale-105'}`}
                            onClick={isRecording ? stopRecording : startRecording}
                        >
                            {isRecording ? (
                                <Square className="h-8 w-8" />
                            ) : (
                                <Mic className="h-8 w-8 text-primary" />
                            )}
                        </Button>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border">
                                <audio src={audioUrl} controls className="h-10 w-full max-w-[200px]" />
                                <Button variant="ghost" size="icon" onClick={reset}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            {!result && (
                                <Button
                                    className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg"
                                    onClick={transcribeAudio}
                                    disabled={isTranscribing}
                                >
                                    {isTranscribing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Transcribing AI Insights...
                                        </>
                                    ) : (
                                        "Ingest Audio to KairOS"
                                    )}
                                </Button>
                            )}
                        </div>
                    )}

                    {isRecording && (
                        <p className="text-xs font-black text-destructive animate-pulse uppercase tracking-widest">Recording Active...</p>
                    )}
                    {!isRecording && !audioUrl && (
                        <p className="text-[10px] text-muted-foreground font-medium italic">Tap to record a strategic note</p>
                    )}
                </div>

                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <h4 className="text-xs font-black uppercase tracking-tighter text-primary mb-1">AI Transcribed Intent</h4>
                            <p className="text-sm leading-relaxed">{result.summary}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Extracted Action Items:</h4>
                            {result.tasks.map((task: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold">{task.title}</p>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{task.description}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[10px] font-bold"
                                        onClick={() => importTask(task)}
                                    >
                                        Import
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full text-[10px] uppercase font-bold" onClick={reset}>
                            New Recording
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
