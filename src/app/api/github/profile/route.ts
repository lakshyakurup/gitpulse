import { NextRequest, NextResponse } from "next/server";
import { getDemoDashboardPayload, demoProfile } from "@/lib/demo-data";
import { getGitHubProfile } from "@/lib/github";
import { isValidGitHubUsername, normalizeUsername } from "@/lib/validation";
import { ApiEnvelope, GitHubProfile } from "@/types";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function GET(request: NextRequest) {
  const username = normalizeUsername(request.nextUrl.searchParams.get("username"));

  if (!username) {
    const body: ApiEnvelope<GitHubProfile> = {
      ok: true,
      data: demoProfile,
      meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "No username provided. Showing demo profile." },
    };

    return NextResponse.json(body, { headers: cacheHeaders });
  }

  if (!isValidGitHubUsername(username)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid GitHub username.",
        meta: { source: "demo", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubProfile>,
      { status: 400, headers: cacheHeaders },
    );
  }

  try {
    const profile = await getGitHubProfile(username);
    return NextResponse.json(
      {
        ok: true,
        data: profile,
        meta: { source: "live", fetchedAt: new Date().toISOString() },
      } satisfies ApiEnvelope<GitHubProfile>,
      { headers: cacheHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        data: getDemoDashboardPayload().profile,
        meta: { source: "demo", fetchedAt: new Date().toISOString(), note: "GitHub API unavailable. Demo fallback active." },
      } satisfies ApiEnvelope<GitHubProfile>,
      { headers: cacheHeaders },
    );
  }
}
