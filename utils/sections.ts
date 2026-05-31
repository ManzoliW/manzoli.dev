import profile from "../public/profile.json";

export type Logo = { src: string; alt: string; href?: string; note?: string; width?: number | string; height?: number | string };

export const stack: Logo[] = [
  { src: "/tech/typescript.webp", alt: "TypeScript" },
  { src: "/tech/vue.webp", alt: "Vue" },
  { src: "/tech/react.webp", alt: "React" },
  { src: "/tech/node.webp", alt: "Node" },
  { src: "/tech/nest.webp", alt: "NestJS" },
  { src: "/tech/aws.webp", alt: "AWS" },
  { src: "/tech/datadog.webp", alt: "Datadog" },
  { src: "/tech/git.png", alt: "Git" },
  { src: "/tech/figma.webp", alt: "Figma" },
  { src: "/tech/python.webp", alt: "Python" },
];

export const companies: Logo[] = [
  {
    src: "/companies/act.svg",
    alt: "ACT Digital",
    href: "https://actdigital.com",
  },
  {
    src: "/companies/banco-inter.webp",
    alt: "Inter",
    href: "https://inter.co",
  },
  {
    src: "/companies/interpag.png",
    alt: "Inter pag",
    href: "https://inter.co",
  },
  {
    src: "/companies/finnet.webp",
    alt: "Finnet",
    href: "https://finnet.com.br",
  },
  {
    src: "/companies/singulare.webp",
    alt: "Singulare",
    href: "https://qitech.com.br/newsroom/qi-tech-faz-aquisicao-da-singulare-corretora-lider-em-fidcs/",
  },
  {
    src: "/companies/fasters.svg",
    alt: "Fasters",
    href: "https://www.fasters.com.br",
  },
];

export const educationLogos: Logo[] = [
  { src: "/institutions/fmu.png", alt: "FMU", width: 150 },
  { src: "/institutions/fiap.png", alt: "FIAP", width: 64 },
  { src: "/institutions/anthropic.png", alt: "Anthropic", width: 120 },
  { src: "/institutions/neo4j.png", alt: "Neo4j", width: 100 },
];

export interface Metric {
  label: string;
  value: string;
}

export interface Job {
  company: string;
  role: string;
  from: string;
  to: string;
  href?: string;
  blurb: string;
  metrics?: Metric[];
}

export const experience: Job[] = profile.experience as Job[];

export const lastSynced: string = profile.lastSyncedAt;

export interface Reference {
  name: string;
  role: string;
  text: string;
  // `picture` in profile.json may still hold legacy LinkedIn signed URLs that
  // have already expired — UI renders initials instead and ignores it.
}

export const references: Reference[] = (profile.references?.linkedin ?? []).map(
  (r: { name: string; role: string; text: string }) => ({
    name: r.name,
    role: r.role,
    text: r.text,
  }),
);

export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export const contacts = {
  email: profile.user.email,
  linkedin: `https://www.linkedin.com/in/${profile.user.username}/`,
  github: `https://www.github.com/${profile.user.github}`,
  x: `https://x.com/${profile.user.x}`,
};

export const me = {
  name: profile.user.name,
  role: profile.user.role,
  location: profile.user["living-at"].replace(/^📍\s*/, ""),
  about:
    profile.user.about.charAt(0).toUpperCase() + profile.user.about.slice(1),
};
