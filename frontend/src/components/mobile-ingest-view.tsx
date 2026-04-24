import { VisionIngestor } from "./vision-ingestor"
import { VoiceRecorder } from "./voice-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Mic } from "lucide-react"

export function MobileIngestView() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight tracking-tighter">Strategic Ingest</h1>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Mobile Extraction Hub</p>
            </header>

            <Tabs defaultValue="vision" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-secondary/20">
                    <TabsTrigger value="vision" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Camera className="h-4 w-4" />
                        Vision
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Mic className="h-4 w-4" />
                        Audio
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="vision" className="mt-6">
                    <VisionIngestor />
                </TabsContent>
                <TabsContent value="audio" className="mt-6">
                    <VoiceRecorder />
                </TabsContent>
            </Tabs>

            <footer className="pt-12 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
                    KairOS Multimodal Engine v1.0
                </p>
            </footer>
        </div>
    )
}
