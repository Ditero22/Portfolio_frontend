import { Mail } from "lucide-react";
import { socialLinkConfig } from "@/shared/data/socialLinks";

function SocialIcon({ label }: { label: string }) {
  if (label === "GitHub") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="sidebar-social-svg"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 .297a12 12 0 0 0-3.793 23.39c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.808 1.305 3.492.998.108-.776.418-1.305.762-1.604-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6.004 0c2.29-1.552 3.296-1.23 3.296-1.23.654 1.653.243 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.921.43.37.823 1.103.823 2.222v3.293c0 .32.216.694.825.576A12.004 12.004 0 0 0 12 .297Z"
        />
      </svg>
    );
  }

  if (label === "Email") {
    return <Mail size={17} strokeWidth={1.8} aria-hidden="true" />;
  }

  if (label === "Facebook") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="sidebar-social-svg sidebar-social-svg--facebook"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.008 10.125 11.854v-8.385H7.078v-3.469h3.047V9.428c0-3.021 1.792-4.69 4.533-4.69 1.312 0 2.686.235 2.686.235v2.953h-1.51c-1.49 0-1.956.93-1.956 1.884v2.263h3.328l-.532 3.469h-2.796v8.385C19.612 23.08 24 18.092 24 12.073Z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="sidebar-social-svg sidebar-social-svg--linkedin"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="4"
        fill="currentColor"
      />
      <circle cx="7" cy="7" r="1.35" fill="var(--page)" />
      <path
        d="M7 10.5v6.8M11.1 17.3v-6.8m0 3c0-1.5.9-2.5 2.3-2.5 1.5 0 2.3 1 2.3 2.5v3.8"
        fill="none"
        stroke="var(--page)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export default function SocialLinks() {
  const availableLinks = socialLinkConfig.filter(
    (link) => link.href !== null,
  );

  return (
    <nav
      aria-label="Social and contact links"
      className="sidebar-social-links"
    >
      {availableLinks.map(({ label, href }) => {
        const external = href?.startsWith("https://") ?? false;

        return (
          <a
            key={label}
            href={href ?? undefined}
            aria-label={label}
            title={label}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="sidebar-social-link"
          >
            <SocialIcon label={label} />
            <span className="sr-only">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
