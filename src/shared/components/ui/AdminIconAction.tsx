import type { ReactNode } from "react";

type AdminIconActionProps = {
  icon: ReactNode;
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  hasDialog?: boolean;
};

export default function AdminIconAction({
  icon,
  label,
  title,
  onClick,
  disabled = false,
  variant = "default",
  hasDialog = false,
}: AdminIconActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`admin-icon-action ${variant === "danger" ? "admin-icon-action--danger" : ""}`}
      aria-label={label}
      title={title}
      aria-haspopup={hasDialog ? "dialog" : undefined}
    >
      {icon}
    </button>
  );
}
