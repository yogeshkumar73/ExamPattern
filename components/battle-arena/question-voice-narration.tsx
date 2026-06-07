"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

interface QuestionVoiceNarrationProps {
  questionTitle: string
  questionDescription: string
  autoPlay?: boolean
  speed?: 'slow' | 'normal' | 'fast'
}

export function QuestionVoiceNarration({
  questionTitle,
  questionDescription,
  autoPlay = false,
  speed = 'normal'
}: QuestionVoiceNarrationProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use Web Speech API for voice narration
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis not supported in your browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speed
    const speedMap = { slow: 0.7, normal: 1, fast: 1.3 };
    utterance.rate = speedMap[speed];
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = `${questionTitle}. ${questionDescription}`;
      speak(fullText);
    }
  };

  useEffect(() => {
    if (autoPlay && !isSpeaking) {
      const fullText = `${questionTitle}. ${questionDescription}`;
      speak(fullText);
    }
  }, [autoPlay, questionTitle, questionDescription]);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isSpeaking ? "destructive" : "outline"}
        onClick={handleSpeak}
        disabled={isLoading}
        className="gap-2"
        title={isSpeaking ? "Stop narration" : "Read question aloud"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isSpeaking ? "Stop" : "Narrate"}
      </Button>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
