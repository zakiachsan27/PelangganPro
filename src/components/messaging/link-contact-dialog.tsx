"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LinkContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkContactDialog({ open, onOpenChange }: LinkContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Contact</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Fitur ini sedang dalam pengembangan.</p>
      </DialogContent>
    </Dialog>
  );
}
