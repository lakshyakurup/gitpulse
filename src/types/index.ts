export type DataSource = "live" | "demo";

export interface ApiMeta {
  source: DataSource;
  fetchedAt: string;
  cached?: boolean;
  stale?: boolean;
  note?: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
  meta: ApiMeta;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  sizeKb: number;
  defaultBranch: string;
  archived: boolean;
  pushedAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repoName: string;
  createdAt: string;
  summary: string;
}

export interface DashboardMetrics {
  totalStars: number;
  totalForks: number;
  activeRepos: number;
  contributionSignal: number;
  activityCount: number;
}

export interface LanguageDatum {
  language: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TelemetrySnapshot {
  cacheHitRate: number;
  avgLatencyMs: number;
  apiCallsSaved: number;
  uptimePercent: number;
  lastSync: string;
  simulated: boolean;
}

export interface DashboardPayload {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  activity: GitHubEvent[];
  metrics: DashboardMetrics;
  languages: LanguageDatum[];
  telemetry: TelemetrySnapshot;
  source: DataSource;
}
