import type { Project } from "../types/project";

const statusLabels = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
} as const;

export function getProjectStatusLabel(
  project: Pick<Project, "role" | "status">,
) {
  const status = project.status ?? "completed";

  if (status === "completed" && /internship/i.test(project.role)) {
    return "Contributed";
  }

  return statusLabels[status] ?? "In progress";
}
