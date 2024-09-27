"use client";
import 'regenerator-runtime/runtime'
import React, { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface SpeechToTextButtonProps {
  onResult: (transcript: string) => void;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ onResult }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onResult(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const handleStart = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US",
    });
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <Button
      type="button"
      onClick={listening ? handleStop : handleStart}
      variant={listening ? "secondary" : "ghost"}
      className="ml-2"
    >
      <FaMicrophone size={20} />
    </Button>
  );
};

export default SpeechToTextButton;