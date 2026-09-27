/** @typedef {{ category?: string | null }} FilterableProject */

/**
 * Keep the public Projects page on one reusable list while category filters
 * only select records from the project system.
 *
 * @template {FilterableProject} T
 * @param {T[]} projects
 * @param {string} category
 * @returns {T[]}
 */
export function filterProjectsByCategory(projects, category) {
  if (category === "all") return projects;

  return projects.filter((project) => (project.category ?? "web") === category);
}
