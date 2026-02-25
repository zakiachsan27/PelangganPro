"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { CompaniesTable } from "@/components/companies/companies-table";
import { CompanyForm } from "@/components/companies/company-form";

export default function CompaniesPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Kelola data perusahaan partner dan klien"
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Company
        </Button>
      </PageHeader>
      <CompaniesTable />
      <CompanyForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
