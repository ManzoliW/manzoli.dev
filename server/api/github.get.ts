import profile from "../../public/profile.json";

interface MinimalRepoRef {
  full_name: string;
}

interface FullRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
    type: "User" | "Organization";
  };
}

interface SearchCommitsResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{ repository: MinimalRepoRef | null }>;
}

interface GithubUserResponse {
  followers: number;
  public_repos: number;
  created_at: string;
}

interface OwnedRepoStub {
  stargazers_count?: number;
  private?: boolean;
  fork?: boolean;
}

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  updatedAt: string;
  owner: string;
  ownerAvatar: string;
  ownerType: "User" | "Organization";
}

export interface GithubStats {
  followers: number;
  publicRepos: number;
  totalStars: number;
  joinedYear: number;
}

export interface GithubPayload {
  stats: GithubStats;
  repos: GithubRepo[];
}

const USERNAME = profile.user.github;
const LIMIT = 10;
const ENRICH_CAP = 20;

const GH_HEADERS: Record<string, string> = {
  "User-Agent": "manzoli.dev",
  Accept: "application/vnd.github+json",
};

export default defineCachedEventHandler(
  async (event): Promise<GithubPayload> => {
    const { githubToken } = useRuntimeConfig(event);
    const headers: Record<string, string> = { ...GH_HEADERS };
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }
    const searchUrl = `https://api.github.com/search/commits?q=author:${USERNAME}&per_page=100&sort=committer-date&order=desc`;
    const userUrl = `https://api.github.com/users/${USERNAME}`;
    const ownedUrl = `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner&sort=updated`;

    const [search, user, owned] = await Promise.all([
      $fetch<SearchCommitsResponse>(searchUrl, { headers }),
      $fetch<GithubUserResponse>(userUrl, { headers }),
      $fetch<OwnedRepoStub[]>(ownedUrl, { headers }),
    ]);

    const totalStars = owned
      .filter((r) => !r.fork && !r.private)
      .reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);

    const stats: GithubStats = {
      followers: user.followers,
      publicRepos: user.public_repos,
      totalStars,
      joinedYear: new Date(user.created_at).getFullYear(),
    };

    const uniqueFullNames: string[] = [];
    const seen = new Set<string>();
    for (const item of search.items) {
      const name = item.repository?.full_name;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      uniqueFullNames.push(name);
      if (uniqueFullNames.length >= ENRICH_CAP) break;
    }

    const enriched = await Promise.all(
      uniqueFullNames.map((fn) =>
        $fetch<FullRepo>(`https://api.github.com/repos/${fn}`, {
          headers,
        }).catch(() => null),
      ),
    );

    const valid = enriched.filter(
      (r): r is FullRepo => !!r && !r.private && !r.archived,
    );

    const byName = new Map<string, FullRepo>();
    for (const r of valid) {
      const key = r.name.toLowerCase();
      const existing = byName.get(key);
      if (!existing || r.stargazers_count > existing.stargazers_count) {
        byName.set(key, r);
      }
    }

    const repos = Array.from(byName.values())
      .map((r) => ({
        name: r.full_name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.pushed_at,
        owner: r.owner.login,
        ownerAvatar: r.owner.avatar_url,
        ownerType: r.owner.type,
      }))
      .sort((a, b) => b.stars - a.stars)
      .slice(0, LIMIT);

    return { stats, repos };
  },
  {
    maxAge: 60 * 60,
    swr: true,
    name: "github-payload",
  },
);
