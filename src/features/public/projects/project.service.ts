import { API_URL } from "@/shared/api";
export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  stack: string[];
  highlights: string[];
  published: boolean;
}
export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/projects`);
  if (!response.ok) throw new Error("Failed to load projects.");
  return response.json();
};
