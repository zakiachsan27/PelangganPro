"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { productsColumns } from "@/components/products/products-columns";
import { ProductForm } from "@/components/products/product-form";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Gagal memuat produk");
      const json = await res.json();
      setProducts(json.data ?? json);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Katalog produk dan layanan Anda">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </PageHeader>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={productsColumns}
          data={products}
          searchKey="name"
          searchPlaceholder="Cari produk..."
        />
      )}
      <ProductForm open={formOpen} onOpenChange={setFormOpen} onSuccess={fetchProducts} />
    </div>
  );
}
