import { useState, useCallback, useEffect, useRef } from "react";

interface UseSpeechToTextReturn {
    isListening: boolean;
    transcript: string;
    error: string | null;
    start: () => void;
    stop: () => void;
    reset: () => void;
    browserSupportsSpeech: boolean;
}

export function useSpeechToText(options: {
    onResult?: (text: string) => void;
    onError?: (error: string) => void;
    lang?: string;
} = {}): UseSpeechToTextReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
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
        recognitionRef.current.lang = options.lang || window.navigator.language || 'en-US';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log("🎤 Speech recognition started");
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("🎤 Speech recognition error:", event.error);
            const errorMsg = event.error === 'not-allowed'
                ? "Microphone access denied"
                : event.error === 'no-speech'
                    ? "No speech detected"
                    : `Error: ${event.error}`;

            setError(errorMsg);
            options.onError?.(errorMsg);
            setIsListening(false);
        };

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
            console.log("🎤 Speech recognition ended");
        };

        return () => {
            recognitionRef.current?.stop();
        };
    }, [options.lang]);

    const start = useCallback(() => {
        if (!recognitionRef.current) return;
        setTranscript("");
        setError(null);
        try {
            recognitionRef.current.start();
        } catch (e) {
            // Already started or busy
            console.warn("Speech recognition already running or error starting:", e);
        }
    }, []);

    const stop = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
    }, []);

    const reset = useCallback(() => {
        setTranscript("");
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        error,
        start,
        stop,
        reset,
        browserSupportsSpeech
    };
}
