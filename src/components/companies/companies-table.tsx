"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import { companiesColumns } from "./companies-columns";
import type { Company } from "@/types";

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      const res = await fetch(`/api/companies?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <DataTable
      columns={companiesColumns}
      data={companies}
      searchKey="name"
      searchPlaceholder="Cari nama perusahaan..."
    />
  );
}
