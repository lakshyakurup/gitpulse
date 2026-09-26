import { NextRequest, NextResponse } from "next/server";
import { demoRepos } from "@/lib/demo-data";
import { getGitHubRepos } from "@/lib/github";
import { isValidGitHubUsername, normalizeUsername } from "@/lib/validation";
import { ApiEnvelope, GitHubRepo } from "@/types";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=90, stale-while-revalidate=180",
};

export async function GET(request: NextRequest) {
  const username = normalizeUsername(request.nextUrl.searchParams.get("username"));

  if (!username) {
    return NextResponse.json(
      {
        ok: true,
        data: demoRepos,
        meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "No username provided. Showing demo repositories." },
      } satisfies ApiEnvelope<GitHubRepo[]>,
      { headers: cacheHeaders },
    );
  }

  if (!isValidGitHubUsername(username)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid GitHub username.",
        meta: { source: "demo", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubRepo[]>,
      { status: 400, headers: cacheHeaders },
    );
  }

  try {
    const repos = await getGitHubRepos(username);
    return NextResponse.json(
      {
        ok: true,
        data: repos,
        meta: { source: "live", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubRepo[]>,
      { headers: cacheHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        data: demoRepos,
        meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "GitHub API unavailable. Demo fallback active." },
      } satisfies ApiEnvelope<GitHubRepo[]>,
      { headers: cacheHeaders },
    );
  }
}
