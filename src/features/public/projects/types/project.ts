export const projectCategories = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "networking", label: "Networking" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
] as const;

export type ProjectCategory = (typeof projectCategories)[number]["value"];
export type ProjectStatus = "completed" | "in-progress" | "planned";
export const projectContributionKinds = [
  { value: "built", label: "I built" },
  { value: "designed", label: "I designed" },
  { value: "supported", label: "I supported" },
  { value: "team", label: "Team handled" },
] as const;

export type ProjectContributionKind =
  (typeof projectContributionKinds)[number]["value"];

export interface ProjectContribution {
  kind: ProjectContributionKind;
  title: string;
  details?: string;
}

export interface Project {
  id: string;
  slug?: string;
  title: string;
  category?: ProjectCategory;
  role: string;
  description: string;
  fullDescription?: string | null;
  stack: string[];
  highlights: string[];
  contributions?: ProjectContribution[] | null;
  coverImageUrl?: string | null;
  images?: string[];
  status?: ProjectStatus;
  sourceUrl?: string | null;
  liveUrl?: string | null;
  featured?: boolean;
  published: boolean;
  sortOrder: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
