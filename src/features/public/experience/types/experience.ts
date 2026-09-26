export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  highlights: string[];
  published: boolean;
  sortOrder: number;
  deletedAt?: string | null;
}

export type ExperienceInput = Pick<
  Experience,
  | "company"
  | "role"
  | "description"
  | "location"
  | "startDate"
  | "endDate"
  | "highlights"
  | "published"
>;
