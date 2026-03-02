"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { ContactGroup, Contact } from "@/types";

export default function ContactGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<ContactGroup | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMembers();
    }
  }, [groupId]);

  async function fetchGroup() {
    try {
      const res = await fetch(`/api/contact-groups/${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      setGroup(data);
    } catch (error) {
      toast.error("Gagal memuat grup");
      router.push("/contact-groups");
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.data || []);
    } catch (error) {
      toast.error("Gagal memuat anggota");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllContacts() {
    try {
      const res = await fetch("/api/contacts?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      // Filter out already added contacts
      const memberIds = new Set(members.map((m) => m.contact_id));
      setAllContacts(data.data?.filter((c: Contact) => !memberIds.has(c.id)) || []);
    } catch (error) {
      toast.error("Gagal memuat kontak");
    }
  }

  async function handleAddMembers() {
    if (selectedContacts.length === 0) {
      toast.error("Pilih minimal 1 kontak");
      return;
    }

    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_ids: selectedContacts }),
      });

      if (!res.ok) throw new Error("Failed to add members");
      
      toast.success(`${selectedContacts.length} kontak berhasil ditambahkan`);
      setSelectedContacts([]);
      setShowAddDialog(false);
      fetchMembers();
      fetchGroup();
    } catch (error) {
      toast.error("Gagal menambahkan kontak");
    }
  }

  async function handleRemoveMember(contactId: string) {
    if (!confirm("Yakin ingin menghapus kontak dari grup?")) return;

    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_ids: [contactId] }),
      });

      if (!res.ok) throw new Error("Failed to remove member");
      
      toast.success("Kontak berhasil dihapus dari grup");
      fetchMembers();
      fetchGroup();
    } catch (error) {
      toast.error("Gagal menghapus kontak");
    }
  }

  function openAddDialog() {
    fetchAllContacts();
    setShowAddDialog(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Grup tidak ditemukan</p>
        <Button onClick={() => router.push("/contact-groups")} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/contact-groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <Badge variant="secondary">{group.contact_count} kontak</Badge>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          )}
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kontak
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Anggota Grup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada kontak di grup ini</p>
              <Button onClick={openAddDialog} variant="outline" className="mt-4">
                Tambah Kontak
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.contact_id}>
                    <TableCell className="font-medium">
                      {member.contact?.first_name} {member.contact?.last_name}
                    </TableCell>
                    <TableCell>{member.contact?.phone || "-"}</TableCell>
                    <TableCell>{member.contact?.whatsapp || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleRemoveMember(member.contact_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Members Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tambah Kontak ke Grup</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddDialog(false)}>
                Tutup
              </Button>
            </div>
            
            {allContacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Semua kontak sudah ada di grup ini
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedContacts.length === allContacts.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContacts(allContacts.map((c) => c.id));
                            } else {
                              setSelectedContacts([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>WhatsApp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact.id]);
                              } else {
                                setSelectedContacts(
                                  selectedContacts.filter((id) => id !== contact.id)
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {contact.first_name} {contact.last_name}
                        </TableCell>
                        <TableCell>{contact.phone || "-"}</TableCell>
                        <TableCell>{contact.whatsapp || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddMembers} disabled={selectedContacts.length === 0}>
                    Tambah {selectedContacts.length} Kontak
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
