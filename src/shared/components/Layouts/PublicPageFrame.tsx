import type { ReactNode } from "react";

interface PublicPageFrameProps {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export default function PublicPageFrame({
  number,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: PublicPageFrameProps) {
  return (
    <main className={`public-page ${className}`}>
      <header className="public-page-header">
        <div className="public-page-header__glow" />
        <div className="public-page-header__topline">
          <p>
            <span className="public-page-header__marker" />
            {number} / {eyebrow}
          </p>
          <span className="public-page-header__edition">Portfolio · 2026</span>
        </div>
        <div className="public-page-header__content">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="public-page-header__footer">
          <span>DESIGN WITH INTENTION</span>
          <span className="public-page-header__rule" />
          <span>BUILD WITH CURIOSITY</span>
        </div>
      </header>
      <div className="public-page-content">{children}</div>
    </main>
  );
}
