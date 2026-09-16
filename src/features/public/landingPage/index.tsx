interface SocialLinkProps {
  label: string;
  href: string;
}

interface StatItemProps {
  value: string;
  label: string;
}

const socialLinks: SocialLinkProps[] = [
  { label: "github", href: "#" },
  { label: "linkedin", href: "#" },
  { label: "instagram", href: "#" },
  { label: "x", href: "#" },
];

const stats: StatItemProps[] = [
  { value: "24", label: "Age" },
  { value: "IT", label: "Degree" },
  { value: "3+", label: "Projects" },
  { value: "PH", label: "Location" },
];

function SocialLink({ label, href }: SocialLinkProps) {
  return (
    <a
      href={href}
      className="transition hover:text-white"
    >
      {label} ↗
    </a>
  );
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="px-3 py-5">
      <p
        className="text-2xl text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </p>
    </div>
  );
}

function ProfilePlaceholder() {
  return (
    <div className="flex h-64 w-48 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] md:h-72 md:w-56">
      <span className="text-sm text-white/30">
        Profile Image
      </span>
    </div>
  );
}

function LandingHero() {
  return (
    <section className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
      <div className="flex justify-center">
        <ProfilePlaceholder />
      </div>

      <div className="text-center md:text-left">
        <h1
          className="text-4xl leading-none text-white md:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Karl Diether
        </h1>

        <div className="mt-4 max-w-md space-y-3 text-sm leading-6 text-white/65">
          <p>
            I'm an IT graduate focused on building modern web
            applications and learning new technologies.
          </p>

          <p>
            Right now I'm building cool new stuff every day. I
            enjoy turning ideas into useful and practical
            applications.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-xs text-white/60 md:justify-start">
          {socialLinks.map((link) => (
            <SocialLink
              key={link.label}
              label={link.label}
              href={link.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsGrid() {
  return (
    <section className="mt-10 border-t border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index < 2
                ? "border-b border-white/10 md:border-b-0 md:border-r"
                : index === 2
                  ? "md:border-r"
                  : ""
            }
          >
            <StatItem
              value={stat.value}
              label={stat.label}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <main className="flex min-h-[calc(100dvh-3rem)] items-start justify-center pt-16 md:min-h-screen md:pt-20">
      <div className="w-full max-w-3xl">
        <LandingHero />
        <StatsGrid />
      </div>
    </main>
  );
}

export default LandingPage;