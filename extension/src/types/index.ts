// ============================================
// PelangganPro Extension Types
// ============================================

export interface AuthData {
  token: string;
  refreshToken?: string;
  orgId: string;
  userId: string;
  expiresAt: number;
}

export interface ContactData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status?: string;
  source?: string;
  tags: Tag[];
  pipeline: PipelineDisplayInfo | null;
  deal: DealInfo | null;
  upcomingTask: TaskInfo | null;
  recentNotes: NoteInfo[];
  assignedTo: AssigneeInfo | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface StageInfo {
  id: string;
  name: string;
  position: number;
}

export interface PipelineInfo {
  id: string;
  name: string;
  stages: StageInfo[];
}

export interface PipelineDisplayInfo {
  id: string;
  name: string;
  stage: string;
  stageId: string;
  status?: 'open' | 'won' | 'lost';
}

export interface DealInfo {
  id: string;
  title: string;
  value: number;
  currency: string;
  status?: 'open' | 'won' | 'lost';
}

export interface TaskInfo {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NoteInfo {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
}

export interface AssigneeInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CreateNoteRequest {
  contactId: string;
  content: string;
}

export interface UpdateNoteRequest {
  noteId: string;
  content: string;
}

export interface UpdateStageRequest {
  contactId: string;
  stageId: string;
}

export interface AssignRequest {
  contactId: string;
  assigneeId: string;
}

export interface CreateReminderRequest {
  contactId: string;
  title: string;
  dueDate: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ExtractedPhone {
  raw: string;
  normalized: string;
  source: 'url' | 'header' | 'aria-label';
}

// --- Tickets ---
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'bug' | 'feature_request' | 'pertanyaan' | 'keluhan_pelanggan' | 'internal';

export interface TicketInfo {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigneeName: string | null;
  createdAt: string;
}

export interface CreateTicketRequest {
  contactId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}
