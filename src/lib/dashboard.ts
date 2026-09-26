import { DashboardMetrics, GitHubEvent, GitHubRepo, LanguageDatum } from "@/types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#2f74c0",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Python: "#3572A5",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export function buildMetrics(repos: GitHubRepo[], activity: GitHubEvent[]): DashboardMetrics {
  const totalStars = repos.reduce((acc, repo) => acc + repo.stars, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks, 0);
  const activeRepos = repos.filter((repo) => !repo.archived).length;
  const contributionSignal = Math.min(100, Math.round((activity.length * 7 + activeRepos * 3) / 2));

  return {
    totalStars,
    totalForks,
    activeRepos,
    contributionSignal,
    activityCount: activity.length,
  };
}

export function buildLanguageDistribution(repos: GitHubRepo[]): LanguageDatum[] {
  const counts = repos.reduce<Record<string, number>>((acc, repo) => {
    const language = repo.language ?? "Other";
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(counts).reduce((acc, value) => acc + value, 0) || 1;

  return Object.entries(counts)
    .map(([language, value]) => ({
      language,
      value,
      percentage: Math.round((value / total) * 100),
      color: LANGUAGE_COLORS[language] ?? "#7c859f",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
