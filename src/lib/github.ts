import { GitHubEvent, GitHubProfile, GitHubRepo } from "@/types";

const BASE_URL = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 8000;

class GitHubApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN ? { Authorization: "token " + process.env.GITHUB_TOKEN } : {}),
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new GitHubApiError(`GitHub API request failed with status ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GitHubApiError("GitHub API request timed out");
    }

    throw new GitHubApiError("Unable to reach GitHub API");
  } finally {
    clearTimeout(timer);
  }
}

interface RawGitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

interface RawGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  archived: boolean;
  pushed_at: string;
  updated_at: string;
  html_url: string;
}

interface RawGitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    action?: string;
    ref_type?: string;
    commits?: Array<{ message?: string }>;
  };
}

function summarizeEvent(event: RawGitHubEvent): string {
  if (event.payload?.commits?.length) {
    return event.payload.commits[0]?.message || "Pushed new commits";
  }

  if (event.payload?.action) {
    return `${event.payload.action} ${event.type.replace("Event", "")}`;
  }

  if (event.payload?.ref_type) {
    return `Created ${event.payload.ref_type}`;
  }

  return event.type.replace("Event", "");
}

export async function getGitHubProfile(username: string): Promise<GitHubProfile> {
  const profile = await fetchGitHub<RawGitHubProfile>(`/users/${encodeURIComponent(username)}`);

  return {
    login: profile.login,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    company: profile.company,
    location: profile.location,
    blog: profile.blog,
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const repos = await fetchGitHub<RawGitHubRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?per_page=20&sort=updated&type=owner`,
  );

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    watchers: repo.watchers_count,
    sizeKb: repo.size,
    defaultBranch: repo.default_branch,
    archived: repo.archived,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at,
    url: repo.html_url,
  }));
}

export async function getGitHubActivity(username: string): Promise<GitHubEvent[]> {
  const activity = await fetchGitHub<RawGitHubEvent[]>(`/users/${encodeURIComponent(username)}/events/public?per_page=12`);

  return activity.map((event) => ({
    id: event.id,
    type: event.type,
    repoName: event.repo.name,
    createdAt: event.created_at,
    summary: summarizeEvent(event),
  }));
}
