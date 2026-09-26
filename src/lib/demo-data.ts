import { DashboardPayload, GitHubEvent, GitHubProfile, GitHubRepo, TelemetrySnapshot } from "@/types";
import { buildLanguageDistribution, buildMetrics } from "@/lib/dashboard";

export const demoProfile: GitHubProfile = {
  login: "demo-dev",
  name: "Demo Developer",
  bio: "Shipping velocity-focused platforms and telemetry-first product experiences.",
  avatarUrl: null,
  company: "GitPulse Labs",
  location: "Remote",
  blog: "https://gitpulse.dev",
  followers: 248,
  following: 96,
  publicRepos: 34,
  createdAt: "2020-01-12T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export const demoRepos: GitHubRepo[] = [
  {
    id: 1,
    name: "telemetry-core",
    fullName: "demo-dev/telemetry-core",
    description: "Unified observability primitives for build-time intelligence.",
    language: "TypeScript",
    stars: 421,
    forks: 58,
    openIssues: 12,
    watchers: 74,
    sizeKb: 2400,
    defaultBranch: "main",
    archived: false,
    pushedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    url: "https://github.com/demo-dev/telemetry-core",
  },
  {
    id: 2,
    name: "edge-cacher",
    fullName: "demo-dev/edge-cacher",
    description: "Client-side cache orchestration for latency-sensitive dashboards.",
    language: "Go",
    stars: 182,
    forks: 19,
    openIssues: 3,
    watchers: 29,
    sizeKb: 1180,
    defaultBranch: "main",
    archived: false,
    pushedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    url: "https://github.com/demo-dev/edge-cacher",
  },
  {
    id: 3,
    name: "portfolio-grid",
    fullName: "demo-dev/portfolio-grid",
    description: "High-polish adaptive UI primitives for developer profiles.",
    language: "JavaScript",
    stars: 96,
    forks: 11,
    openIssues: 0,
    watchers: 21,
    sizeKb: 860,
    defaultBranch: "main",
    archived: false,
    pushedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: "https://github.com/demo-dev/portfolio-grid",
  },
  {
    id: 4,
    name: "signal-worker",
    fullName: "demo-dev/signal-worker",
    description: "Background event stream processors with resilient retries.",
    language: "Python",
    stars: 140,
    forks: 24,
    openIssues: 8,
    watchers: 26,
    sizeKb: 1530,
    defaultBranch: "main",
    archived: false,
    pushedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    url: "https://github.com/demo-dev/signal-worker",
  },
];

export const demoActivity: GitHubEvent[] = [
  {
    id: "evt-1",
    type: "PushEvent",
    repoName: "demo-dev/telemetry-core",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    summary: "Pushed telemetry optimizer improvements",
  },
  {
    id: "evt-2",
    type: "PullRequestEvent",
    repoName: "demo-dev/edge-cacher",
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    summary: "Opened PR for stale cache merge strategy",
  },
  {
    id: "evt-3",
    type: "IssuesEvent",
    repoName: "demo-dev/signal-worker",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    summary: "Closed incident issue for retry backoff",
  },
  {
    id: "evt-4",
    type: "CreateEvent",
    repoName: "demo-dev/portfolio-grid",
    createdAt: new Date(Date.now() - 1000 * 60 * 780).toISOString(),
    summary: "Created experimental dashboard branch",
  },
];

export function getDemoTelemetry(): TelemetrySnapshot {
  return {
    cacheHitRate: 46,
    avgLatencyMs: 178,
    apiCallsSaved: 12,
    uptimePercent: 99.9,
    lastSync: new Date().toISOString(),
    simulated: true,
  };
}

export function getDemoDashboardPayload(): DashboardPayload {
  return {
    profile: demoProfile,
    repos: demoRepos,
    activity: demoActivity,
    metrics: buildMetrics(demoRepos, demoActivity),
    languages: buildLanguageDistribution(demoRepos),
    telemetry: getDemoTelemetry(),
    source: "demo",
  };
}
