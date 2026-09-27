import assert from "node:assert/strict";
import test from "node:test";
import { filterProjectsByCategory } from "../src/features/public/projects/utils/filterProjects.js";

const projects = [
  { id: "web", category: "web" },
  { id: "network", category: "networking" },
  { id: "legacy" },
  { id: "mobile", category: "mobile" },
];

test("project category filters include all records and default legacy records to web", () => {
  assert.deepEqual(
    filterProjectsByCategory(projects, "all").map((project) => project.id),
    ["web", "network", "legacy", "mobile"],
  );
  assert.deepEqual(
    filterProjectsByCategory(projects, "web").map((project) => project.id),
    ["web", "legacy"],
  );
  assert.deepEqual(
    filterProjectsByCategory(projects, "networking").map(
      (project) => project.id,
    ),
    ["network"],
  );
});
