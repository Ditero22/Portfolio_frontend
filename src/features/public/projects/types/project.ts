export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  stack: string[];
  highlights: string[];
  published: boolean;
  sortOrder: number;
  deletedAt?: string | null;
}
