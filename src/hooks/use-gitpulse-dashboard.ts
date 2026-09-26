"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { buildLanguageDistribution, buildMetrics } from "@/lib/dashboard";
import { getDemoDashboardPayload } from "@/lib/demo-data";
import { getCacheTelemetry, getCachedValue, setCachedValue } from "@/lib/cache";
import { ApiEnvelope, DashboardPayload, DataSource, GitHubEvent, GitHubProfile, GitHubRepo, TelemetrySnapshot } from "@/types";

const TTL_MS = 1000 * 60;

async function fetchEnvelope<T>(url: string): Promise<ApiEnvelope<T>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export function useGitPulseDashboard(initialUsername = "") {
  const [username, setUsername] = useState(initialUsername);
  const [payload, setPayload] = useState<DashboardPayload>(getDemoDashboardPayload());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (nextUsername: string) => {
    setLoading(true);
    setError(null);

    const target = nextUsername.trim();
    const fallback = getDemoDashboardPayload();
    const key = target || "demo";

    const profileCache = getCachedValue<ApiEnvelope<GitHubProfile>>(`${key}:profile`, true);
    const repoCache = getCachedValue<ApiEnvelope<GitHubRepo[]>>(`${key}:repos`, true);
    const activityCache = getCachedValue<ApiEnvelope<GitHubEvent[]>>(`${key}:activity`, true);

    const start = performance.now();

    try {
      const [profile, repos, activity, telemetry] = await Promise.all([
        profileCache.value
          ? Promise.resolve(profileCache.value)
          : fetchEnvelope<GitHubProfile>(`/api/github/profile?username=${encodeURIComponent(target)}`),
        repoCache.value
          ? Promise.resolve(repoCache.value)
          : fetchEnvelope<GitHubRepo[]>(`/api/github/repos?username=${encodeURIComponent(target)}`),
        activityCache.value
          ? Promise.resolve(activityCache.value)
          : fetchEnvelope<GitHubEvent[]>(`/api/github/activity?username=${encodeURIComponent(target)}`),
        fetchEnvelope<TelemetrySnapshot>("/api/telemetry"),
      ]);

      if (!profileCache.value) setCachedValue(`${key}:profile`, profile, TTL_MS, TTL_MS * 2, profile.meta);
      if (!repoCache.value) setCachedValue(`${key}:repos`, repos, TTL_MS, TTL_MS * 2, repos.meta);
      if (!activityCache.value) setCachedValue(`${key}:activity`, activity, TTL_MS, TTL_MS * 2, activity.meta);

      const source: DataSource =
        profile.meta.source === "live" && repos.meta.source === "live" && activity.meta.source === "live" ? "live" : "demo";

      const cacheTelemetry = getCacheTelemetry();
      const runtimeMs = Math.round(performance.now() - start);
      const repoData = repos.data ?? fallback.repos;
      const activityData = activity.data ?? fallback.activity;

      setPayload({
        profile: profile.data ?? fallback.profile,
        repos: repoData,
        activity: activityData,
        metrics: buildMetrics(repoData, activityData),
        languages: buildLanguageDistribution(repoData),
        telemetry: {
          ...(telemetry.data ?? fallback.telemetry),
          cacheHitRate: cacheTelemetry.cacheHitRate,
          apiCallsSaved: cacheTelemetry.hits + cacheTelemetry.staleHits,
          avgLatencyMs: runtimeMs,
          lastSync: new Date().toISOString(),
          simulated: true,
        },
        source,
      });
    } catch {
      setPayload(fallback);
      setError("GitHub data is currently unavailable. Demo mode enabled.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(username);
  }, [fetchData, username]);

  const refresh = useCallback(() => {
    void fetchData(username);
  }, [fetchData, username]);

  const isDemo = useMemo(() => payload.source === "demo", [payload.source]);

  return {
    username,
    setUsername,
    loading,
    error,
    payload,
    isDemo,
    refresh,
  };
}
