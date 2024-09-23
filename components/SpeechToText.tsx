// components/SpeechToTextButton.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface SpeechToTextButtonProps {
  onResult: (transcript: string) => void;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  let recognition: SpeechRecognition | null = null;

  useEffect(() => {
    // Check if the browser supports the SpeechRecognition API
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    // Clean up when the component is unmounted
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [isListening, onResult]);

  const handleButtonClick = () => {
    setIsListening((prevState) => !prevState);
  };

  return (
    <Button
      type="button"
      onClick={handleButtonClick}
      variant={isListening ? "secondary" : "ghost"}
      className="ml-2"
    >
      <FaMicrophone size={20} />
    </Button>
  );
};

export default SpeechToTextButton;