import type { Project } from "@/features/public/projects/types/project";

export type ProjectInput = {
  slug: string;
  title: string;
  category: NonNullable<Project["category"]>;
  role: string;
  description: string;
  fullDescription: string;
  stack: string[];
  highlights: string[];
  coverImageUrl: string;
  images: string[];
  status: NonNullable<Project["status"]>;
  sourceUrl: string;
  liveUrl: string;
  featured: boolean;
  published: boolean;
};
