import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contact, ContactRfm } from "@/types";
import { getInitials, formatRelativeTime } from "@/lib/format";

function formatCurrency(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

interface SegmentCustomerTableProps {
  customers: (Contact & { rfm: ContactRfm })[];
}

export function SegmentCustomerTable({ customers }: SegmentCustomerTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daftar Pelanggan ({customers.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-center">R</TableHead>
              <TableHead className="text-center">F</TableHead>
              <TableHead className="text-center">M</TableHead>
              <TableHead className="text-right hidden md:table-cell">Total Spent</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Last Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const fullName = `${customer.first_name} ${customer.last_name || ""}`.trim();
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/contacts/${customer.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{fullName}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {customer.email || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <RfmScoreCell value={customer.rfm.scores.recency} />
                  </TableCell>
                  <TableCell className="text-center">
                    <RfmScoreCell value={customer.rfm.scores.frequency} />
                  </TableCell>
                  <TableCell className="text-center">
                    <RfmScoreCell value={customer.rfm.scores.monetary} />
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell text-sm font-medium">
                    {formatCurrency(customer.rfm.total_spent)}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell text-sm text-muted-foreground">
                    {customer.rfm.last_purchase_date
                      ? formatRelativeTime(customer.rfm.last_purchase_date)
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RfmScoreCell({ value }: { value: number }) {
  const bgColor =
    value >= 4
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : value >= 3
        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        : value >= 2
          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-semibold ${bgColor}`}>
      {value}
    </span>
  );
}
