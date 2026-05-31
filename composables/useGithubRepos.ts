export interface GithubRepo {
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  updatedAt: string
  owner: string
  ownerAvatar: string
  ownerType: 'User' | 'Organization'
}

export interface GithubStats {
  followers: number
  publicRepos: number
  totalStars: number
  joinedYear: number
}

export interface GithubPayload {
  stats: GithubStats
  repos: GithubRepo[]
}

const emptyPayload = (): GithubPayload => ({
  stats: { followers: 0, publicRepos: 0, totalStars: 0, joinedYear: 0 },
  repos: [],
})

export function useGithub() {
  return useFetch<GithubPayload>('/api/github', {
    key: 'github-payload',
    default: emptyPayload,
  })
}
