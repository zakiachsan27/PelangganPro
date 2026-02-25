// ============================================
// Core Types for PelangganPro CRM
// ============================================

// --- Enums ---
export type UserRole = "owner" | "admin" | "manager" | "agent" | "viewer";
export type ContactStatus = "lead" | "active" | "inactive" | "customer";
export type ContactSource = "whatsapp" | "instagram" | "web" | "referral" | "tokopedia" | "shopee" | "import" | "manual";
export type DealStatus = "open" | "won" | "lost";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type PlanTier = "free" | "starter" | "pro" | "ai";
export type DeploymentMode = "saas" | "self-hosted";
export type ActivityAction =
  | "created"
  | "updated"
  | "stage_changed"
  | "note_added"
  | "won"
  | "lost"
  | "converted"
  | "assigned"
  | "tagged";
export type EntityType = "contact" | "deal" | "company" | "task" | "ticket";

// --- Organizations ---
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  plan_tier: PlanTier;
  deployment_mode: DeploymentMode;
  created_at: string;
  updated_at: string;
}

// --- Users / Profiles ---
export interface Profile {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Companies ---
export interface Company {
  id: string;
  org_id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  contact_count?: number;
  deal_count?: number;
}

// --- Tags ---
export interface Tag {
  id: string;
  org_id: string;
  name: string;
  color: string;
  created_at: string;
}

// --- Contacts ---
export interface Contact {
  id: string;
  org_id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  position: string | null;
  source: ContactSource | null;
  status: ContactStatus;
  custom_fields: Record<string, unknown>;
  avatar_url: string | null;
  owner_id: string | null;
  created_by: string | null;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
  // Joined
  company?: Company;
  tags?: Tag[];
  owner?: Profile;
}

// --- Pipelines ---
export interface Pipeline {
  id: string;
  org_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

// --- Deals ---
export interface Deal {
  id: string;
  org_id: string;
  pipeline_id: string;
  stage_id: string;
  contact_id: string | null;
  company_id: string | null;
  title: string;
  value: number;
  currency: string;
  owner_id: string | null;
  status: DealStatus;
  won_lost_reason: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  source: ContactSource | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  contact?: Contact;
  company?: Company;
  owner?: Profile;
  stage?: PipelineStage;
  tags?: Tag[];
}

// --- Notes ---
export interface Note {
  id: string;
  org_id: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  author?: Profile;
}

// --- Activities ---
export interface Activity {
  id: string;
  org_id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActivityAction;
  details: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
  // Joined
  actor?: Profile;
}

// --- Tasks ---
export interface Task {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  assignee?: Profile;
  contact?: Contact;
  deal?: Deal;
}

// --- Branding ---
export interface Branding {
  id: string;
  org_id: string;
  app_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  support_email: string | null;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

// --- Feature Flags ---
export interface FeatureFlag {
  id: string;
  org_id: string | null;
  feature_key: string;
  enabled: boolean;
  min_tier: PlanTier;
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- Invitations ---
export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

// --- Permissions ---
export interface Permission {
  id: string;
  role: UserRole;
  module: string;
  action: "create" | "read" | "update" | "delete";
  allowed: boolean;
  created_at: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalContacts: number;
  newContactsThisMonth: number;
  totalDeals: number;
  openDealsValue: number;
  wonThisMonth: number;
  wonValue: number;
  tasksDueToday: number;
  overdueTasks: number;
}

export interface PipelineFunnel {
  stage: string;
  count: number;
  value: number;
  color: string;
}

export interface RevenueData {
  month: string;
  value: number;
}

// --- Products ---
export type ProductStatus = "active" | "draft";

export interface Product {
  id: string;
  org_id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  description: string | null;
  stock: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

// --- Messaging / WhatsApp ---
export type WaProvider = "bailey" | "qontak" | "waha";
export type WaSessionStatus = "disconnected" | "connecting" | "qr_pending" | "connected";
export type WaMessageDirection = "inbound" | "outbound";
export type WaMessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";
export type WaMessageType = "text" | "image" | "document" | "audio" | "video" | "sticker" | "location" | "contact";
export type WaConversationStatus = "open" | "resolved" | "pending";

export interface WaSession {
  id: string;
  org_id: string;
  provider: WaProvider;
  label: string;
  phone_number: string | null;
  status: WaSessionStatus;
  connected_at: string | null;
  created_at: string;
  qr_code_data: string | null; // Bailey only
  api_key: string | null;      // Qontak only (masked)
}

export interface WaConversation {
  id: string;
  session_id: string;
  contact_id: string | null;
  remote_jid: string;
  remote_name: string;
  phone_number: string | null;
  status: WaConversationStatus;
  assigned_to: string | null;
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
  provider: WaProvider;
  contact?: { phone: string | null; whatsapp: string | null } | null;
}

export interface WaMessage {
  id: string;
  conversation_id: string;
  direction: WaMessageDirection;
  type: WaMessageType;
  body: string;
  media_url: string | null;
  status: WaMessageStatus;
  sender_name: string | null;
  sender_id: string | null;
  quoted_message_id: string | null;
  created_at: string;
}

export interface WaQuickReply {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
}

// --- RFM Segmentation ---
export type RfmScore = { recency: number; frequency: number; monetary: number };
export type RfmSegment =
  | "champions"
  | "loyal"
  | "potential"
  | "new_customers"
  | "at_risk"
  | "hibernating"
  | "lost";

export interface RfmSegmentInfo {
  key: RfmSegment;
  label: string;
  description: string;
  color: string;         // Tailwind color class (e.g. "emerald")
  colorHex: string;      // Hex for charts
  minR: number;
  maxR: number;
  minF: number;
  maxF: number;
  minM: number;
  maxM: number;
}

export interface ContactRfm {
  contact_id: string;
  segment: RfmSegment;
  scores: RfmScore;
  total_purchases: number;
  last_purchase_date: string | null;
  total_spent: number;
  avg_order_value: number;
}

// --- Broadcast ---
export type BroadcastChannel = "whatsapp" | "email";
export type BroadcastStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface BroadcastCampaign {
  id: string;
  org_id: string;
  name: string;
  channel: BroadcastChannel;
  target_segments: RfmSegment[];
  target_count: number;
  status: BroadcastStatus;
  subject: string | null;       // email only
  message_body: string;
  scheduled_at: string | null;
  sent_at: string | null;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  org_id: string;
  name: string;
  channel: BroadcastChannel;
  subject: string | null;
  body: string;
  target_segment: RfmSegment | "all";
  created_at: string;
}

// --- Tickets ---
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "bug" | "feature_request" | "pertanyaan" | "keluhan_pelanggan" | "internal";

export interface Ticket {
  id: string;
  org_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee_id: string | null;
  contact_id: string | null;
  reporter_id: string;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  assignee?: Profile;
  contact?: Contact;
  reporter?: Profile;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  created_at: string;
  // Joined
  author?: Profile;
}
