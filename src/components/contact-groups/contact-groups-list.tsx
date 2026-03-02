"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ContactGroup } from "@/types";

interface ContactGroupsListProps {
  onEdit: (group: ContactGroup) => void;
}

export function ContactGroupsList({ onEdit }: ContactGroupsListProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/contact-groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat grup kontak");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(groupId: string) {
    if (!confirm("Yakin ingin menghapus grup ini? Kontak di dalamnya tidak akan terhapus.")) return;
    
    try {
      const res = await fetch(`/api/contact-groups/${groupId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Grup berhasil dihapus");
      fetchGroups();
    } catch (error) {
      toast.error("Gagal menghapus grup");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada grup kontak</h3>
        <p className="text-sm text-slate-500 mb-4">Buat grup untuk mengelompokkan kontak</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Grup</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Jumlah Kontak</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} className="cursor-pointer hover:bg-slate-50">
              <TableCell 
                className="font-medium"
                onClick={() => router.push(`/contacts?tab=groups&group=${group.id}`)}
              >
                {group.name}
              </TableCell>
              <TableCell onClick={() => router.push(`/contacts?tab=groups&group=${group.id}`)}>
                {group.description || "-"}
              </TableCell>
              <TableCell onClick={() => router.push(`/contacts?tab=groups&group=${group.id}`)}>
                <Badge variant="secondary">{group.contact_count} kontak</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/contacts?tab=groups&group=${group.id}`)}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(group)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(group.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
