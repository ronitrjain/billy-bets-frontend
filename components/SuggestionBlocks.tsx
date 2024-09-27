"use client";

import { Card, CardHeader, CardDescription } from "@/components/ui/card";

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
        "What are the key stats I should consider before betting on Green Bay Packers vs Minnesota Vikings?",
    },
    {
      title: "Props for Week 3",
      description: "How has Jayden Reed performed in their last 3 games, and what are their best prop bets for their upcoming game?",
    },
    {
      title: "Ravens vs. Cowboys",
      description:
        "How do Cardinals and Commanders match up head-to-head, and should I bet on the over/under for their combined points?",
    },
  ];

  return (
    <div className="rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 p-4 justify-items-stretch">
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