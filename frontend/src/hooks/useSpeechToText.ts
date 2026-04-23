import { useState, useCallback, useEffect, useRef } from "react";

interface UseSpeechToTextReturn {
    isListening: boolean;
    transcript: string;
    start: () => void;
    stop: () => void;
    reset: () => void;
    browserSupportsSpeech: boolean;
}

export function useSpeechToText(options: { onResult?: (text: string) => void } = {}): UseSpeechToTextReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    const browserSupportsSpeech = typeof window !== 'undefined' && (
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    );

    useEffect(() => {
        if (!browserSupportsSpeech) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                options.onResult?.(finalTranscript);
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const start = useCallback(() => {
        if (!recognitionRef.current) return;
        setTranscript("");
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Speech recognition error:", e);
        }
    }, []);

    const stop = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    const reset = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        isListening,
        transcript,
        start,
        stop,
        reset,
        browserSupportsSpeech
    };
}
