import type { RfmSegment, RfmSegmentInfo } from "@/types";

/** Human-readable segment labels */
export const RFM_SEGMENT_LABELS: Record<RfmSegment, string> = {
  champions: "Champions",
  loyal: "Loyal Customers",
  potential: "Potential Loyalist",
  new_customers: "New Customers",
  at_risk: "At Risk",
  hibernating: "Hibernating",
  lost: "Lost",
};

/** Tailwind bg/text color classes per segment */
export const RFM_SEGMENT_COLORS: Record<RfmSegment, { bg: string; text: string; dot: string }> = {
  champions:     { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  loyal:         { bg: "bg-blue-100 dark:bg-blue-950",       text: "text-blue-700 dark:text-blue-300",       dot: "bg-blue-500" },
  potential:     { bg: "bg-violet-100 dark:bg-violet-950",   text: "text-violet-700 dark:text-violet-300",   dot: "bg-violet-500" },
  new_customers: { bg: "bg-amber-100 dark:bg-amber-950",     text: "text-amber-700 dark:text-amber-300",     dot: "bg-amber-500" },
  at_risk:       { bg: "bg-orange-100 dark:bg-orange-950",   text: "text-orange-700 dark:text-orange-300",   dot: "bg-orange-500" },
  hibernating:   { bg: "bg-slate-100 dark:bg-slate-800",     text: "text-slate-700 dark:text-slate-300",     dot: "bg-slate-500" },
  lost:          { bg: "bg-red-100 dark:bg-red-950",         text: "text-red-700 dark:text-red-300",         dot: "bg-red-500" },
};

/** Display order for overview */
export const RFM_SEGMENT_ORDER: RfmSegment[] = [
  "champions",
  "loyal",
  "potential",
  "new_customers",
  "at_risk",
  "hibernating",
  "lost",
];

/** Full segment definitions with score ranges and descriptions */
export const RFM_SEGMENTS: RfmSegmentInfo[] = [
  {
    key: "champions",
    label: "Champions",
    description: "Pelanggan terbaik — beli sering, baru-baru ini, dan nilai tinggi.",
    color: "emerald",
    colorHex: "#10b981",
    minR: 4, maxR: 5, minF: 4, maxF: 5, minM: 4, maxM: 5,
  },
  {
    key: "loyal",
    label: "Loyal Customers",
    description: "Pelanggan setia dengan frekuensi dan nilai belanja konsisten.",
    color: "blue",
    colorHex: "#3b82f6",
    minR: 3, maxR: 5, minF: 3, maxF: 5, minM: 3, maxM: 5,
  },
  {
    key: "potential",
    label: "Potential Loyalist",
    description: "Baru membeli dan punya potensi jadi pelanggan setia.",
    color: "violet",
    colorHex: "#8b5cf6",
    minR: 3, maxR: 5, minF: 1, maxF: 3, minM: 1, maxM: 3,
  },
  {
    key: "new_customers",
    label: "New Customers",
    description: "Pelanggan baru dengan pembelian pertama baru-baru ini.",
    color: "amber",
    colorHex: "#f59e0b",
    minR: 4, maxR: 5, minF: 1, maxF: 1, minM: 1, maxM: 3,
  },
  {
    key: "at_risk",
    label: "At Risk",
    description: "Pelanggan bernilai tinggi yang mulai jarang membeli.",
    color: "orange",
    colorHex: "#f97316",
    minR: 1, maxR: 2, minF: 3, maxF: 5, minM: 3, maxM: 5,
  },
  {
    key: "hibernating",
    label: "Hibernating",
    description: "Sudah lama tidak membeli, frekuensi dan nilai rendah.",
    color: "slate",
    colorHex: "#64748b",
    minR: 1, maxR: 2, minF: 1, maxF: 2, minM: 1, maxM: 3,
  },
  {
    key: "lost",
    label: "Lost",
    description: "Pelanggan yang sudah sangat lama tidak aktif.",
    color: "red",
    colorHex: "#ef4444",
    minR: 1, maxR: 1, minF: 1, maxF: 1, minM: 1, maxM: 5,
  },
];
