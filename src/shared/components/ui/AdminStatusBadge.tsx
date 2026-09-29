import type { ReactNode } from "react";

type AdminStatusBadgeProps = {
  children: ReactNode;
  variant?: "public" | "quiet";
};

export default function AdminStatusBadge({
  children,
  variant = "quiet",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`admin-status-badge admin-status-badge--${variant}`}
    >
      {children}
    </span>
  );
}
