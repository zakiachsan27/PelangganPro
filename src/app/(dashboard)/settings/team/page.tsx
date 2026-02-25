"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MoreHorizontal, UserX, Shield, KeyRound, LayoutGrid, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/format";
import type { Profile, UserRole } from "@/types";
import { toast } from "sonner";
import {
  ASSIGNABLE_MENUS,
  type MenuHref,
  useMenuAccess,
  setMenuAccess,
} from "@/stores/menu-access";

const roleColors: Record<string, string> = {
  owner: "bg-accent text-accent-foreground",
  admin: "bg-primary/10 text-primary",
  manager: "bg-success/15 text-success-foreground",
  agent: "bg-secondary text-secondary-foreground",
  viewer: "bg-warning/15 text-warning-foreground",
};

const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
  viewer: "Viewer",
};

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteConfirmPassword, setInviteConfirmPassword] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("agent");
  const [inviteMenus, setInviteMenus] = useState<MenuHref[]>(ASSIGNABLE_MENUS.map((m) => m.href));

  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("agent");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [accessOpen, setAccessOpen] = useState(false);
  const [accessUserId, setAccessUserId] = useState<string | null>(null);
  const [selectedMenus, setSelectedMenus] = useState<MenuHref[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (data) setUsers(data as Profile[]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat anggota tim");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const editUser = editUserId ? users.find((u) => u.id === editUserId) ?? null : null;
  const passwordUser = passwordUserId ? users.find((u) => u.id === passwordUserId) ?? null : null;
  const accessUser = accessUserId ? users.find((u) => u.id === accessUserId) ?? null : null;

  // --- Invite ---
  function handleInvite() {
    if (!inviteName.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!inviteEmail) {
      toast.error("Email wajib diisi");
      return;
    }
    if (!invitePassword) {
      toast.error("Password wajib diisi");
      return;
    }
    if (invitePassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (invitePassword !== inviteConfirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (inviteMenus.length === 0) {
      toast.error("Pilih minimal satu menu");
      return;
    }
    toast.success(`Anggota ${inviteName} berhasil ditambahkan (demo)`);
    setInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInvitePassword("");
    setInviteConfirmPassword("");
    setInviteRole("agent");
    setInviteMenus(ASSIGNABLE_MENUS.map((m) => m.href));
  }

  const inviteAllMenusSelected = inviteMenus.length === ASSIGNABLE_MENUS.length;

  // --- Edit Role ---
  function openEditDialog(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditUserId(userId);
      setEditRole(user.role);
      setEditOpen(true);
    }
  }

  function handleEditSave() {
    if (editUser) {
      toast.success(`Role ${editUser.full_name} diperbarui ke ${roleLabels[editRole]} (demo)`);
    }
    setEditOpen(false);
    setEditUserId(null);
  }

  // --- Set Password ---
  function openPasswordDialog(userId: string) {
    setPasswordUserId(userId);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOpen(true);
  }

  function handlePasswordSave() {
    if (!newPassword) {
      toast.error("Password baru wajib diisi");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (passwordUser) {
      toast.success(`Password ${passwordUser.full_name} berhasil diperbarui (demo)`);
    }
    setPasswordOpen(false);
    setPasswordUserId(null);
    setNewPassword("");
    setConfirmPassword("");
  }

  // --- Menu Access ---
  function openAccessDialog(userId: string) {
    setAccessUserId(userId);
    setAccessOpen(true);
  }

  function toggleMenu(href: MenuHref) {
    setSelectedMenus((prev) =>
      prev.includes(href) ? prev.filter((m) => m !== href) : [...prev, href]
    );
  }

  function selectAllMenus() {
    setSelectedMenus(ASSIGNABLE_MENUS.map((m) => m.href));
  }

  function deselectAllMenus() {
    setSelectedMenus([]);
  }

  function handleAccessSave() {
    if (accessUserId) {
      setMenuAccess(accessUserId, selectedMenus);
      if (accessUser) {
        toast.success(`Akses menu ${accessUser.full_name} berhasil diperbarui`);
      }
    }
    setAccessOpen(false);
    setAccessUserId(null);
  }

  // --- Revoke ---
  function handleRevoke(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      toast.success(`Akses ${user.full_name} telah dicabut (demo)`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Anggota Tim ({users.length})
          </CardTitle>

          {/* Invite Dialog */}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Anggota Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-name" className="text-xs">Nama Lengkap *</Label>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email" className="text-xs">Email *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-password" className="text-xs">Password *</Label>
                    <Input
                      id="invite-password"
                      type="password"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-confirm-password" className="text-xs">Konfirmasi *</Label>
                    <Input
                      id="invite-confirm-password"
                      type="password"
                      value={inviteConfirmPassword}
                      onChange={(e) => setInviteConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Hak Akses Menu</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() =>
                        inviteAllMenusSelected
                          ? setInviteMenus([])
                          : setInviteMenus(ASSIGNABLE_MENUS.map((m) => m.href))
                      }
                    >
                      {inviteAllMenusSelected ? "Hapus Semua" : "Pilih Semua"}
                    </Button>
                  </div>
                  <div className="space-y-1 rounded-lg border bg-card p-3">
                    {ASSIGNABLE_MENUS.map((menu) => (
                      <label
                        key={menu.href}
                        className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-1"
                      >
                        <Checkbox
                          checked={inviteMenus.includes(menu.href)}
                          onCheckedChange={() =>
                            setInviteMenus((prev) =>
                              prev.includes(menu.href)
                                ? prev.filter((m) => m !== menu.href)
                                : [...prev, menu.href]
                            )
                          }
                        />
                        <span className="text-sm">{menu.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inviteMenus.length} dari {ASSIGNABLE_MENUS.length} menu dipilih
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleInvite}>
                    Tambah Anggota
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <TeamMemberRow
                key={user.id}
                user={user}
                onEditRole={() => openEditDialog(user.id)}
                onSetPassword={() => openPasswordDialog(user.id)}
                onSetAccess={() => openAccessDialog(user.id)}
                onRevoke={() => handleRevoke(user.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Role</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <UserInfo user={editUser} />
              <div className="space-y-1.5">
                <Label className="text-xs">Role Baru</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditSave}>
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
          </DialogHeader>
          {passwordUser && (
            <div className="space-y-4">
              <UserInfo user={passwordUser} />
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs">Password Baru *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs">Konfirmasi Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setPasswordOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handlePasswordSave}>
                  Simpan Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu Access Dialog */}
      <AccessDialog
        open={accessOpen}
        onOpenChange={setAccessOpen}
        user={accessUser}
        selectedMenus={selectedMenus}
        setSelectedMenus={setSelectedMenus}
        onToggleMenu={toggleMenu}
        onSelectAll={selectAllMenus}
        onDeselectAll={deselectAllMenus}
        onSave={handleAccessSave}
      />
    </div>
  );
}

// --- Sub-components ---

function UserInfo({ user }: { user: Profile }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {getInitials(user.full_name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{user.full_name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}

function TeamMemberRow({
  user,
  onEditRole,
  onSetPassword,
  onSetAccess,
  onRevoke,
}: {
  user: Profile;
  onEditRole: () => void;
  onSetPassword: () => void;
  onSetAccess: () => void;
  onRevoke: () => void;
}) {
  const userMenus = useMenuAccess(user.id);
  const totalMenus = ASSIGNABLE_MENUS.length;
  const hasRestriction = userMenus.length < totalMenus;

  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {getInitials(user.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{user.full_name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {hasRestriction && (
            <span className="text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
              {userMenus.length}/{totalMenus} menu
            </span>
          )}
        </div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          roleColors[user.role]
        }`}
      >
        {user.role}
      </span>
      <Badge
        variant={user.is_active ? "outline" : "destructive"}
        className="text-xs"
      >
        {user.is_active ? "Active" : "Inactive"}
      </Badge>

      {user.role !== "owner" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditRole}>
              <Shield className="mr-2 h-4 w-4" />
              Ubah Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSetPassword}>
              <KeyRound className="mr-2 h-4 w-4" />
              Set Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSetAccess}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Atur Akses Menu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onRevoke}
            >
              <UserX className="mr-2 h-4 w-4" />
              Cabut Akses
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}

function AccessDialog({
  open,
  onOpenChange,
  user,
  selectedMenus,
  setSelectedMenus,
  onToggleMenu,
  onSelectAll,
  onDeselectAll,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
  selectedMenus: MenuHref[];
  setSelectedMenus: (menus: MenuHref[]) => void;
  onToggleMenu: (href: MenuHref) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSave: () => void;
}) {
  // Load current menus when user changes
  const currentMenus = useMenuAccess(user?.id ?? "");

  // Sync selectedMenus when dialog opens with a user
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  if (user && user.id !== lastUserId && open) {
    setLastUserId(user.id);
    setSelectedMenus([...currentMenus]);
  }
  if (!open && lastUserId !== null) {
    setLastUserId(null);
  }

  const allSelected = selectedMenus.length === ASSIGNABLE_MENUS.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atur Akses Menu</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <UserInfo user={user} />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Menu yang bisa diakses</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={allSelected ? onDeselectAll : onSelectAll}
                >
                  {allSelected ? "Hapus Semua" : "Pilih Semua"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Menu yang tidak dicentang akan disembunyikan dari sidebar user ini.
              </p>
            </div>
            <div className="space-y-1 rounded-lg border bg-card p-3">
              {ASSIGNABLE_MENUS.map((menu) => (
                <label
                  key={menu.href}
                  className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-1"
                >
                  <Checkbox
                    checked={selectedMenus.includes(menu.href)}
                    onCheckedChange={() => onToggleMenu(menu.href)}
                  />
                  <span className="text-sm">{menu.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                {selectedMenus.length} dari {ASSIGNABLE_MENUS.length} menu dipilih
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
                <Button onClick={onSave}>
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
