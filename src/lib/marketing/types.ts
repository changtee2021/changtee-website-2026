import type { MarketingSource } from "@/lib/marketing/consent";

export type MarketingStatus = "subscribed" | "unsubscribed";

export type MarketingSubscriber = {
  id: string;
  email: string;
  emailNormalized: string;
  fullName: string | null;
  source: MarketingSource;
  status: MarketingStatus;
  consentVersion: string;
  consentText: string;
  consentedAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeToken: string;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
};
