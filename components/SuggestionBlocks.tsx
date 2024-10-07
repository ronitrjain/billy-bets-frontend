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
        "What are the key stats from this season I should consider before betting Saints vs. Chiefs?",
    },
    {
      title: "Props for Week 3",
      description: "How has Travis Kelce performed in games when the Chiefs #1 and #2 WRs are injured?",
    },
    {
      title: "Ravens vs. Cowboys",
      description:
        "What are some interesting props for the saints vs chiefs game?",
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