"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const periods = [
  { value: "7d", label: "7 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "3m", label: "3 Bulan" },
  { value: "12m", label: "12 Bulan" },
] as const;

export type PeriodValue = (typeof periods)[number]["value"];

interface PeriodFilterProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex rounded-lg border bg-muted p-0.5 gap-0.5">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 text-xs rounded-md text-muted-foreground hover:text-foreground",
            value === period.value && "bg-background text-foreground font-medium shadow-sm"
          )}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
