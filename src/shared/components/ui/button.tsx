import type { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "default"
  | "primary"
  | "danger"
  | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
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
      "border border-white/10 text-white/60 hover:border-white/20 hover:text-white",
    primary:
      "bg-white text-black hover:bg-white/80",
    danger:
      "border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300",
    ghost:
      "text-white/50 hover:bg-white/[0.06] hover:text-white",
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