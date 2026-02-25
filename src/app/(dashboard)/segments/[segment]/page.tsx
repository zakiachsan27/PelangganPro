import { notFound } from "next/navigation";
import { SegmentDetail } from "@/components/segments/segment-detail";
import { RFM_SEGMENTS, RFM_SEGMENT_ORDER } from "@/lib/rfm";
import type { RfmSegment } from "@/types";

interface SegmentDetailPageProps {
  params: Promise<{ segment: string }>;
}

export default async function SegmentDetailPage({ params }: SegmentDetailPageProps) {
  const { segment: segmentKey } = await params;
  const segment = RFM_SEGMENTS.find((s) => s.key === segmentKey as RfmSegment);

  if (!segment) {
    notFound();
  }

  return <SegmentDetail segment={segment} />;
}

export function generateStaticParams() {
  return RFM_SEGMENT_ORDER.map((key) => ({ segment: key }));
}
