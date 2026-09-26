import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    default:
      "border border-ink/10 text-ink/60 hover:border-ink/20 hover:text-ink",
    primary: "bg-ink text-paper hover:bg-ink/80",
    danger:
      "border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300",
    ghost: "text-ink/50 hover:bg-ink/[0.06] hover:text-ink",
  };

  return (
    <button
      type="button"
      className={`rounded-md px-4 py-2 text-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
