// ============================================
// PelangganPro Extension Types
// ============================================

export interface AuthData {
  token: string;
  orgId: string;
  userId: string;
  expiresAt: number;
}

export interface ContactData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tags: Tag[];
  pipeline: PipelineInfo | null;
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

export interface PipelineInfo {
  id: string;
  name: string;
  stage: string;
  stageId: string;
}

export interface DealInfo {
  id: string;
  title: string;
  value: number;
  currency: string;
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
