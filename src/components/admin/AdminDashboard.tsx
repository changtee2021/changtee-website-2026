import { AdminAnalyticsOverview } from "@/components/admin/AdminAnalyticsOverview";

type AdminDashboardProps = {
  basePath: string;
};

export function AdminDashboard({ basePath }: AdminDashboardProps) {
  return <AdminAnalyticsOverview basePath={basePath} />;
}
