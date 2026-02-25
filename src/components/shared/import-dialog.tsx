"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  expectedColumns: string[];
}

export function ImportDialog({
  open,
  onOpenChange,
  entityName,
  expectedColumns,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".csv")) {
      toast.error("Hanya file CSV yang didukung");
      return;
    }

    setFile(f);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length === 0) return;

      const csvHeaders = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      setHeaders(csvHeaders);

      const rows = lines.slice(1, 6).map((line) =>
        line.split(",").map((cell) => cell.trim().replace(/"/g, ""))
      );
      setPreview(rows);
    };
    reader.readAsText(f);
  }

  function handleImport() {
    console.log("Importing file:", file?.name, "for entity:", entityName);
    toast.success(`${preview.length} ${entityName} berhasil diimport (demo)`);
    handleReset();
    onOpenChange(false);
  }

  function handleReset() {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {entityName}</DialogTitle>
        </DialogHeader>

        {!file ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Klik untuk upload file CSV</p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: .csv (comma-separated)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Kolom yang diharapkan:</p>
              <p>{expectedColumns.join(", ")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-success-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset}>
                <X className="h-3 w-3" />
              </Button>
            </div>

            {preview.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Preview ({Math.min(preview.length, 5)} baris pertama)
                </p>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((h, i) => (
                          <TableHead key={i} className="text-xs whitespace-nowrap">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => (
                            <TableCell key={ci} className="text-xs whitespace-nowrap">
                              {cell || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { handleReset(); onOpenChange(false); }}>
                Batal
              </Button>
              <Button onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import {preview.length} Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
