const adminBase = "/dtro-secret/admin";

export const adminRoutes = {
  base: adminBase,
  login: `${adminBase}/sign-in`,
  dashboard: adminBase,
  blog: `${adminBase}/manage/blog`,
  projects: `${adminBase}/manage/projects`,
  experience: `${adminBase}/manage/experience`,
  stack: `${adminBase}/manage/stack`,
  certifications: `${adminBase}/manage/certifications`,
  recommendations: `${adminBase}/manage/recommendations`,
  skills: `${adminBase}/manage/skills`,
  resources: `${adminBase}/manage/resources`,
  settings: `${adminBase}/settings`,
  fallback: `${adminBase}/*`,
} as const;

export function isAdminPath(pathname: string) {
  return pathname === adminBase || pathname.startsWith(`${adminBase}/`);
}
