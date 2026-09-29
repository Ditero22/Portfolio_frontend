export type PortfolioContentKind =
  | "stack"
  | "certifications"
  | "recommendations"
  | "skills"
  | "resources";

export interface PortfolioContent {
  id: string;
  kind: PortfolioContentKind;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
  published: boolean;
  sortOrder: number;
}

export type PortfolioContentInput = Pick<
  PortfolioContent,
  "title" | "subtitle" | "description" | "category" | "url" | "published"
> & { imageUrl?: string | null };
