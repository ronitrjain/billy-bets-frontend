"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface SuggestionBlocksProps {
  onSuggestionClick: (suggestion: string) => void;
}

export default function SuggestionBlocks({
  onSuggestionClick,
}: SuggestionBlocksProps) {
  const suggestions = [
    {
      title: "Tua's Injury",
      description:
        "What are the key stats I should consider before betting on Cowboys vs Giants?",
    },
    {
      title: "Props for Week 3",
      description: "How has Ceedee Lamb performed in his last 3 games?",
    },
    {
      title: "Ravens vs. Cowboys",
      description:
        "How do Dallas Cowboys and New York Giants match up head-to-head?",
    },
  ];

  return (
    <div className="rounded-lg grid grid-cols-3 gap-4 p-4 justify-items-stretch">
      {suggestions.map((suggestion, index) => (
        <Card
          key={index}
          className="cursor-pointer rounded-xl w-full h-full"
          onClick={() => onSuggestionClick(suggestion.description)}
        >
          <CardHeader className="pb-2 mt-4 pt-0">
            <CardDescription className="text-md">
              {suggestion.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}