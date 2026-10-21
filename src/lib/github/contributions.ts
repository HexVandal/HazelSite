export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionsResponse {
  total: { lastYear?: number; [key: string]: number | undefined };
  contributions: ContributionDay[];
}

const API_BASE = "https://github-contributions-api.jogruber.de/v4";

/**
 * Public GitHub contributions feed. It is CORS friendly, needs no token and
 * returns the same calendar you see on a GitHub profile.
 */
export async function fetchContributions(
  username: string,
  signal?: AbortSignal,
): Promise<ContributionsResponse> {
  const response = await fetch(
    `${API_BASE}/${encodeURIComponent(username)}?y=last`,
    { signal, headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load contributions for ${username} (${response.status})`,
    );
  }

  const data = (await response.json()) as ContributionsResponse;

  if (!Array.isArray(data.contributions)) {
    throw new Error("Unexpected contributions payload");
  }

  return data;
}
