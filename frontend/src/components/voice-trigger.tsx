import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { useAppStore } from "@/stores/useAppStore"
import { processVoiceCommand } from "@/lib/voice-commands"

interface VoiceTriggerProps {
    onTranscript?: (text: string) => void;
    autoCommand?: boolean;
    className?: string;
}

export function VoiceTrigger({ onTranscript, autoCommand = true, className }: VoiceTriggerProps) {
    const { isListening, transcript, start, stop, browserSupportsSpeech } = useSpeechToText({
        onResult: (text) => {
            if (autoCommand) {
                const handled = processVoiceCommand(text, useAppStore.getState().setCurrentView);
                if (handled) {
                    stop();
                    return;
                }
            }
            onTranscript?.(text);
        }
    });

    if (!browserSupportsSpeech) return null;

    return (
        <div className={`relative flex items-center gap-2 ${className}`}>
            {isListening && (
                <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping pointer-events-none" />
            )}
            <Button
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={isListening ? stop : start}
                className={`relative rounded-full transition-all duration-300 ${isListening ? 'scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'hover:scale-105 shadow-sm'}`}
                title={isListening ? "Stop Listening" : "Start Voice Command"}
            >
                {isListening ? (
                    <Mic className="h-4 w-4 animate-pulse" />
                ) : (
                    <Mic className="h-4 w-4 text-primary" />
                )}
            </Button>

            {isListening && (
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">Listening...</span>
                    <span className="text-[10px] font-medium text-muted-foreground italic line-clamp-1 max-w-[120px]">
                        {transcript || "Speak now..."}
                    </span>
                </div>
            )}
        </div>
    );
}
