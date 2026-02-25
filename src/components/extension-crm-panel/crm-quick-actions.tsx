"use client";

import { useState } from "react";
import { Handshake, CheckSquare, StickyNote, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealForm } from "@/components/deals/deal-form";
import { TaskForm } from "@/components/tasks/task-form";
import { NoteForm } from "@/components/notes/note-form";
import { toast } from "sonner";

interface CrmQuickActionsProps {
  contactId?: string;
}

export function CrmQuickActions({ contactId }: CrmQuickActionsProps) {
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setDealFormOpen(true)}
          >
            <Handshake className="mr-1.5 h-3.5 w-3.5" />
            Create Deal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setTaskFormOpen(true)}
          >
            <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
            Create Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setNoteOpen(!noteOpen)}
          >
            <StickyNote className="mr-1.5 h-3.5 w-3.5" />
            Add Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => toast.info("Assign agent (demo)")}
          >
            <UserCog className="mr-1.5 h-3.5 w-3.5" />
            Assign Agent
          </Button>
        </div>

        {noteOpen && (
          <div className="mt-3">
            <NoteForm
              onSubmit={(content) => {
                console.log("CRM panel note:", content);
                toast.success("Catatan berhasil ditambahkan");
                setNoteOpen(false);
              }}
            />
          </div>
        )}
      </div>

      <DealForm
        open={dealFormOpen}
        onOpenChange={setDealFormOpen}
        defaultContactId={contactId}
      />
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        defaultContactId={contactId}
      />
    </>
  );
}
