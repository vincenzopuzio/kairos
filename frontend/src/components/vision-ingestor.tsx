import { useState, useRef } from "react"
import { Camera, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateTask } from "@/hooks/useTasks"

export function VisionIngestor() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const createMutation = useCreateTask()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const analyzeImage = async () => {
        if (!file) return
        setIsAnalyzing(true)
        setResult(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vision/analyze`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (!response.ok) throw new Error("Vision analysis failed")
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const importTask = (task: any) => {
        createMutation.mutate({
            title: task.title,
            description: task.description,
            priority: task.priority,
            is_deep_work: task.is_deep_work,
            status: 'todo'
        })
    }

    const reset = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
    }

    return (
        <Card className="max-w-2xl mx-auto border-dashed border-2 bg-secondary/10">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Strategic Vision Ingestor
                </CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">OCR & Image Analysis for Mobile Documentation</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {!preview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-64 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/5 transition-all group"
                    >
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">Capture Document or Whiteboard</p>
                            <p className="text-[10px] text-muted-foreground">Tap to take photo or upload image</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border shadow-xl max-h-80">
                            <img src={preview} alt="Preview" className="w-full h-full object-contain bg-black" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8"
                                onClick={reset}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {!result && (
                            <Button
                                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg"
                                onClick={analyzeImage}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Multimodal Context...
                                    </>
                                ) : (
                                    "Analyze Strategic Content"
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <h4 className="text-xs font-black uppercase tracking-tighter text-primary mb-1">Strategic Summary</h4>
                            <p className="text-sm leading-relaxed">{result.summary}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Proposed KairOS Tasks:</h4>
                            {result.suggested_tasks.map((task: any, idx: number) => (
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
                            Analyze Another Image
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
