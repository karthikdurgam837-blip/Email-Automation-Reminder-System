export type MessageStatus = 'scheduled' | 'sent' | 'failed' | 'bounced' | 'opened';

export interface Contact {
  id: string;
  name: string;
  email: string;
  timezone: string;
  unsubscribed: number;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: number;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  senderName: string;
  senderEmail: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  contactId: string;
  campaignId: string;
  startAt: number;
  cron?: string;
  active: number;
  lastFiredAt?: number;
}

export interface Message {
  id: string;
  campaignId: string;
  contactId: string;
  scheduledAt: number;
  sentAt?: number;
  status: MessageStatus;
  subject: string;
  body: string;
  error?: string;
}
