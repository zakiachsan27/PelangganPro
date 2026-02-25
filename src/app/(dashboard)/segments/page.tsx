import { PageHeader } from "@/components/shared/page-header";
import { SegmentOverview } from "@/components/segments/segment-overview";

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Segmen Pelanggan"
        description="Kelola segmen pelanggan berdasarkan analisis RFM (Recency, Frequency, Monetary)"
      />
      <SegmentOverview />
    </div>
  );
}
