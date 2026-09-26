import { NextRequest, NextResponse } from "next/server";
import { demoActivity } from "@/lib/demo-data";
import { getGitHubActivity } from "@/lib/github";
import { isValidGitHubUsername, normalizeUsername } from "@/lib/validation";
import { ApiEnvelope, GitHubEvent } from "@/types";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=45, stale-while-revalidate=90",
};

export async function GET(request: NextRequest) {
  const username = normalizeUsername(request.nextUrl.searchParams.get("username"));

  if (!username) {
    return NextResponse.json(
      {
        ok: true,
        data: demoActivity,
        meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "No username provided. Showing demo activity." },
      } satisfies ApiEnvelope<GitHubEvent[]>,
      { headers: cacheHeaders },
    );
  }

  if (!isValidGitHubUsername(username)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid GitHub username.",
        meta: { source: "demo", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubEvent[]>,
      { status: 400, headers: cacheHeaders },
    );
  }

  try {
    const activity = await getGitHubActivity(username);
    return NextResponse.json(
      {
        ok: true,
        data: activity,
        meta: { source: "live", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubEvent[]>,
      { headers: cacheHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        data: demoActivity,
        meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "GitHub API unavailable. Demo fallback active." },
      } satisfies ApiEnvelope<GitHubEvent[]>,
      { headers: cacheHeaders },
    );
  }
}
