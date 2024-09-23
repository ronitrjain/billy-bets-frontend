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
        "What is the Dolphins' record without Tua as their starter?",
    },
    {
      title: "Props for Week 3",
      description: "Give me 5 interesting props for Week 3",
    },
    {
      title: "Ravens vs. Cowboys",
      description:
        "What is Dak Prescott's record when playing vs. AFC playoff teams at home?",
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
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {suggestion.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}