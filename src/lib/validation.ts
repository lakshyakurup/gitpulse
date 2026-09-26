const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeUsername(input: string | null): string | null {
  const value = input?.trim();
  return value ? value : null;
}

export function isValidGitHubUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
