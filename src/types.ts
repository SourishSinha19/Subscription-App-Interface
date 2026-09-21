export type SubscriptionStatus =
  | 'flagged_inactive'
  | 'active'
  | 'cancelling'
  | 'cancelled'
  | 'paused';

export type CancellationStrategy = 'concierge' | 'pause' | 'manual';

export interface Subscription {
  id: string;
  name: string;
  code: string;
  cost: number;
  billingCycle: 'month' | 'year';
  spentToDate: number;
  monthsActive: number;
  renewalDate: string;
  status: SubscriptionStatus;
  inactivityDays: number;
  usageScore: number;
  usageRating: 'Very Low' | 'Low' | 'Moderate' | 'High';
  costPerSession: number;
  sessionsTotal: number;
  annualizedSavings: number;
  logoUrl?: string;
  category: string;
  selectedStrategy: CancellationStrategy;
  pauseMonths: number;
  restartPreventionAlert: boolean;
  legalNoticeRef?: string;
  terminatedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilterOption = 'all' | 'flagged_inactive' | 'active' | 'paused' | 'cancelled';

export interface CreateSubscriptionPayload {
  name: string;
  code?: string;
  cost: number;
  billingCycle?: 'month' | 'year';
  category?: string;
  renewalDate?: string;
  inactivityDays?: number;
  usageScore?: number;
  sessionsTotal?: number;
  selectedStrategy?: CancellationStrategy;
  restartPreventionAlert?: boolean;
}

export interface UpdateSubscriptionPayload {
  name?: string;
  cost?: number;
  billingCycle?: 'month' | 'year';
  status?: SubscriptionStatus;
  selectedStrategy?: CancellationStrategy;
  pauseMonths?: number;
  restartPreventionAlert?: boolean;
  notes?: string;
}

export interface TerminateSubscriptionPayload {
  strategy?: CancellationStrategy;
  pauseMonths?: number;
  notes?: string;
}

export interface SubscriptionsSummary {
  totalCount: number;
  flaggedCount: number;
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  totalMonthlyWaste: number;
  totalAnnualSavings: number;
}

export interface SubscriptionsApiResponse {
  success: boolean;
  subscriptions: Subscription[];
  total: number;
  filter: StatusFilterOption;
  summary: SubscriptionsSummary;
  timestamp: string;
}

export interface SingleSubscriptionApiResponse {
  success: boolean;
  subscription: Subscription;
  message?: string;
  timestamp: string;
}

export interface HttpTelemetryEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  statusText: string;
  durationMs: number;
  requestPayload?: unknown;
  responsePayload?: unknown;
}
