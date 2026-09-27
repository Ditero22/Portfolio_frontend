export const projectCategories = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "networking", label: "Networking" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
] as const;

export type ProjectCategory = (typeof projectCategories)[number]["value"];
export type ProjectStatus = "completed" | "in-progress" | "planned";

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
