/**
 * Stub file — all dummy data removed.
 * These exports exist only to prevent import errors from pages
 * that haven't been migrated to real Supabase data yet.
 * Each export returns empty arrays / null values.
 */

import type {
  Organization,
  Profile,
  Company,
  Tag,
  Contact,
  Pipeline,
  PipelineStage,
  Deal,
  Note,
  Activity,
  Task,
  EntityType,
  DashboardStats,
  PipelineFunnel,
  RevenueData,
  Branding,
  Product,
  WaSession,
  WaConversation,
  WaMessage,
  WaQuickReply,
  RfmSegmentInfo,
  RfmSegment,
  ContactRfm,
  BroadcastCampaign,
  MessageTemplate,
  Ticket,
  TicketComment,
} from "@/types";

// ============================================
// Organization
// ============================================
export const dummyOrg: Organization = {
  id: "",
  name: "",
  slug: "",
  logo_url: null,
  settings: {},
  plan_tier: "free",
  deployment_mode: "saas",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================
// Branding
// ============================================
export const dummyBranding: Branding = {
  id: "",
  org_id: "",
  app_name: "PelangganPro",
  logo_url: null,
  favicon_url: null,
  primary_color: "#6366f1",
  accent_color: "#8b5cf6",
  support_email: "",
  custom_css: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================
// Users / Profiles
// ============================================
export const dummyUsers: Profile[] = [];
export const currentUser: Profile | undefined = undefined;

// ============================================
// Companies
// ============================================
export const dummyCompanies: Company[] = [];

// ============================================
// Tags
// ============================================
export const dummyTags: Tag[] = [];

// ============================================
// Contacts
// ============================================
export const dummyContacts: Contact[] = [];

// ============================================
// Pipeline & Stages
// ============================================
export const dummyStages: PipelineStage[] = [];
export const dummyPipeline: Pipeline = {
  id: "",
  org_id: "",
  name: "Default Pipeline",
  stages: [],
  is_default: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================
// Deals
// ============================================
export const dummyDeals: Deal[] = [];

// ============================================
// Tasks
// ============================================
export const dummyTasks: Task[] = [];

// ============================================
// Notes
// ============================================
export const dummyNotes: Note[] = [];

// ============================================
// Activities
// ============================================
export const dummyActivities: Activity[] = [];

// ============================================
// Dashboard Stats
// ============================================
export const dummyDashboardStats: DashboardStats = {
  totalContacts: 0,
  newContactsThisMonth: 0,
  openDealsValue: 0,
  totalDeals: 0,
  wonValue: 0,
  wonThisMonth: 0,
  tasksDueToday: 0,
  overdueTasks: 0,
};

// ============================================
// Pipeline Funnel
// ============================================
export const dummyPipelineFunnel: PipelineFunnel[] = [];

// ============================================
// Revenue Data
// ============================================
export const dummyRevenueData: RevenueData[] = [];

// ============================================
// Products
// ============================================
export const dummyProducts: Product[] = [];

// ============================================
// WA Sessions
// ============================================
export const dummyWaSessions: WaSession[] = [];

// ============================================
// WA Conversations
// ============================================
export const dummyWaConversations: WaConversation[] = [];

// ============================================
// WA Messages
// ============================================
export const dummyWaMessages: WaMessage[] = [];

// ============================================
// WA Quick Replies
// ============================================
export const dummyWaQuickReplies: WaQuickReply[] = [];

// ============================================
// RFM Segments
// ============================================
export const rfmSegments: RfmSegmentInfo[] = [];

// ============================================
// RFM Data
// ============================================
export const dummyRfmData: ContactRfm[] = [];

// ============================================
// Broadcast
// ============================================
export const dummyBroadcasts: BroadcastCampaign[] = [];
export const dummyMessageTemplates: MessageTemplate[] = [];

// ============================================
// Tickets
// ============================================
export const dummyTicketComments: TicketComment[] = [];
export const dummyTickets: Ticket[] = [];

// ============================================
// Helper / lookup functions (return undefined / empty)
// ============================================
export function getUserById(_id: string): Profile | undefined {
  return undefined;
}
export function getCompanyById(_id: string): Company | undefined {
  return undefined;
}
export function getContactById(_id: string): Contact | undefined {
  return undefined;
}
export function getDealById(_id: string): Deal | undefined {
  return undefined;
}
export function getStageById(_id: string): PipelineStage | undefined {
  return undefined;
}
export function getDealsForStage(_stageId: string): Deal[] {
  return [];
}
export function getContactsForCompany(_companyId: string): Contact[] {
  return [];
}
export function getDealsForContact(_contactId: string): Deal[] {
  return [];
}
export function getNotesForEntity(
  _entityType: "contact" | "deal" | "company",
  _entityId: string
): Note[] {
  return [];
}
export function getActivitiesForEntity(
  _entityType: EntityType,
  _entityId: string
): Activity[] {
  return [];
}
export function getTasksForEntity(
  _entityType: "contact" | "deal",
  _entityId: string
): Task[] {
  return [];
}
export function getWaSessionById(_id: string): WaSession | undefined {
  return undefined;
}
export function getConversationById(_id: string): WaConversation | undefined {
  return undefined;
}
export function getMessagesForConversation(_conversationId: string): WaMessage[] {
  return [];
}
export function getConversationsForContact(_contactId: string): WaConversation[] {
  return [];
}
export function getConversationsForSession(_sessionId: string): WaConversation[] {
  return [];
}
export function getRfmForContact(_contactId: string): ContactRfm | undefined {
  return undefined;
}
export function getContactsForSegment(
  _segment: RfmSegment
): (Contact & { rfm: ContactRfm })[] {
  return [];
}
export function getSegmentInfo(_segment: RfmSegment): RfmSegmentInfo | undefined {
  return undefined;
}
export function getSegmentStats(_segment: RfmSegment) {
  return { count: 0, avgRevenue: 0, avgRecency: 0, totalRevenue: 0, avgLtv: 0 };
}
export function getBroadcastById(_id: string): BroadcastCampaign | undefined {
  return undefined;
}
export function getTicketById(_id: string): Ticket | undefined {
  return undefined;
}
export function getCommentsForTicket(_ticketId: string): TicketComment[] {
  return [];
}
