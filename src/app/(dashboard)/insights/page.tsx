import { PageHeader } from "@/components/shared/page-header";
import { InsightOverview } from "@/components/insights/insight-overview";
import { RfmHeatmap } from "@/components/insights/rfm-heatmap";
import { CustomerTrend } from "@/components/insights/customer-trend";
import { SegmentComparison } from "@/components/insights/segment-comparison";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Insight"
        description="Analisis dan insight pelanggan berdasarkan data RFM"
      />

      <InsightOverview />

      <div className="grid gap-6 lg:grid-cols-3">
        <RfmHeatmap />
        <div className="lg:col-span-2 grid gap-6">
          <CustomerTrend />
          <SegmentComparison />
        </div>
      </div>
    </div>
  );
}
