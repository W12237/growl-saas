// ============================================================
// Agency OS — Shared Type Definitions
// ============================================================

// ── Auth & Users ──
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  department?: string;
  title?: string;
  phone?: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  memberCount: number;
  createdAt: string;
}

// ── CRM ──
export type LeadStage = 'lead' | 'prospect' | 'meeting' | 'proposal' | 'contract' | 'client';
export type LeadSource = 'website' | 'referral' | 'social' | 'ads' | 'cold_outreach' | 'event' | 'other';

export interface Lead {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone?: string;
  stage: LeadStage;
  source: LeadSource;
  industry?: string;
  value: number;
  currency: string;
  probability: number;
  notes?: string;
  assignedTo?: User;
  tags: string[];
  lastActivity?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Clients ──
export type ClientStatus = 'active' | 'inactive' | 'churned' | 'onboarding';
export type ClientHealth = 'excellent' | 'good' | 'at_risk' | 'critical';

export interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  website?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  health: ClientHealth;
  monthlyRetainer: number;
  currency: string;
  totalRevenue: number;
  projectCount: number;
  activeCampaigns: number;
  joinedAt: string;
  lastInteraction?: string;
  socialAccounts?: SocialAccount[];
  notes?: string;
  tags: string[];
}

export interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest';
  handle: string;
  url: string;
  followers?: number;
}

// ── Projects ──
export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  client?: Client;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  currency: string;
  teamMembers: User[];
  taskCount: number;
  completedTasks: number;
  tags: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
}

// ── Campaigns ──
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignPlatform = 'meta' | 'google_ads' | 'tiktok' | 'snapchat' | 'linkedin' | 'x' | 'pinterest';

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  client?: Client;
  status: CampaignStatus;
  platforms: CampaignPlatform[];
  objective: string;
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate?: string;
  kpis: CampaignKPI[];
  teamMembers: User[];
  createdAt: string;
}

export interface CampaignKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
}

// ── Finance ──
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  status: InvoiceStatus;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// ── Dashboard ──
export interface DashboardMetrics {
  revenue: MetricValue;
  activeClients: MetricValue;
  profit: MetricValue;
  tasksDue: MetricValue;
  pendingApprovals: number;
  upcomingMeetings: Meeting[];
  recentActivities: Activity[];
  campaignPerformance: ChartData[];
  teamProductivity: TeamMember[];
  aiInsights: AIInsight[];
}

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  currency?: string;
  sparkline?: number[];
}

export interface Meeting {
  id: string;
  title: string;
  clientName?: string;
  startTime: string;
  endTime: string;
  type: 'google_meet' | 'zoom' | 'teams' | 'in_person';
  attendees: User[];
  link?: string;
}

export interface Activity {
  id: string;
  type: 'task_completed' | 'client_added' | 'invoice_paid' | 'campaign_launched' | 'approval_received' | 'meeting_scheduled' | 'comment_added' | 'file_uploaded';
  title: string;
  description: string;
  user: User;
  timestamp: string;
  entityId?: string;
  entityType?: string;
}

export interface ChartData {
  label: string;
  value: number;
  previousValue?: number;
}

export interface TeamMember {
  user: User;
  tasksCompleted: number;
  tasksTotal: number;
  hoursLogged: number;
  efficiency: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'suggestion' | 'trend';
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  createdAt: string;
}

// ── Notifications ──
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ── Navigation ──
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
  section?: string;
}
