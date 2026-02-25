import type { RfmSegment } from "@/types";
import { cn } from "@/lib/utils";
import { RFM_SEGMENT_LABELS, RFM_SEGMENT_COLORS } from "@/lib/rfm";

interface RfmBadgeProps {
  segment: RfmSegment;
  className?: string;
}

export function RfmBadge({ segment, className }: RfmBadgeProps) {
  const colors = RFM_SEGMENT_COLORS[segment];
  const label = RFM_SEGMENT_LABELS[segment];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}
