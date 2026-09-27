type CategorizedProject = {
  category?: string | null;
};

export function filterProjectsByCategory<T extends CategorizedProject>(
  projects: T[],
  category: string,
): T[];
