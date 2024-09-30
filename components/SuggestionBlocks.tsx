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
        "How will the absence of Tua Tagovailoa affect the Dolphins' offensive strategy against the Titans?",
    },
    {
      title: "Props for Week 3",
      description: "What are some betting props for Jared Goff that could be good picks for the Seahawks vs. Lions game? ",
    },
    {
      title: "Ravens vs. Cowboys",
      description:
        "How has Will Levis performed statistically when playing on the road against a top-15 defense?",
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