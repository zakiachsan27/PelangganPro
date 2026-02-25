"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";

const settingsTabs = [
  { title: "Profile", href: "/settings/profile" },
  { title: "Organization", href: "/settings/organization" },
  { title: "Team", href: "/settings/team" },
  { title: "Branding", href: "/settings/branding" },
  { title: "Integrations", href: "/settings/integrations" },
  { title: "Extension", href: "/settings/extension" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Kelola pengaturan akun dan organisasi" />

      <div className="flex gap-1 border-b bg-card rounded-t-xl px-2 pt-2">
        {settingsTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              pathname === tab.href
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab.title}
          </Link>
        ))}
      </div>

      <div>{children}</div>
    </div>
  );
}
