"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns: { key: string; label: string }[];
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  function handleExport() {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          const str = val != null ? String(val) : "";
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`${data.length} data berhasil diexport`);
  }

  return (
    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExport}>
      <Download className="h-3.5 w-3.5" />
      Export
    </Button>
  );
}
