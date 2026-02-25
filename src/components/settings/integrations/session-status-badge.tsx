import type { WaSessionStatus } from "@/types";

const statusConfig: Record<WaSessionStatus, { label: string; className: string }> = {
  connected: {
    label: "Connected",
    className: "bg-success/15 text-success-foreground",
  },
  disconnected: {
    label: "Disconnected",
    className: "bg-secondary text-secondary-foreground",
  },
  qr_pending: {
    label: "Scan QR",
    className: "bg-warning/15 text-warning-foreground",
  },
  connecting: {
    label: "Connecting...",
    className: "bg-primary/10 text-primary",
  },
};

interface SessionStatusBadgeProps {
  status: WaSessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === "connected" ? "bg-success-foreground" :
        status === "disconnected" ? "bg-secondary-foreground" :
        status === "qr_pending" ? "bg-warning-foreground" :
        "bg-primary"
      }`} />
      {config.label}
    </span>
  );
}
