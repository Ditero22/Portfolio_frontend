export default function PageSkeleton() {
  return (
    <div
      className="page-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading page…</span>
      <div className="page-skeleton__content" aria-hidden="true">
        <div className="page-skeleton__heading">
          <span className="admin-skeleton-block h-3 w-28 rounded-full" />
          <span className="admin-skeleton-block h-10 w-56 rounded-xl" />
          <span className="admin-skeleton-block h-4 w-72 max-w-full rounded-full" />
        </div>

        <div className="page-skeleton__feature">
          <div className="page-skeleton__feature-art admin-skeleton-block" />
          <div className="page-skeleton__feature-copy">
            <span className="admin-skeleton-block h-3 w-24 rounded-full" />
            <span className="admin-skeleton-block h-7 w-4/5 rounded-lg" />
            <span className="admin-skeleton-block h-4 w-full rounded-full" />
            <span className="admin-skeleton-block h-4 w-3/4 rounded-full" />
            <span className="admin-skeleton-block mt-3 h-10 w-36 rounded-full" />
          </div>
        </div>

        <div className="page-skeleton__cards">
          {Array.from({ length: 3 }, (_, index) => (
            <article className="page-skeleton__card" key={index}>
              <span className="admin-skeleton-block h-3 w-16 rounded-full" />
              <span className="admin-skeleton-block h-5 w-4/5 rounded-lg" />
              <span className="admin-skeleton-block h-3 w-full rounded-full" />
              <span className="admin-skeleton-block h-3 w-2/3 rounded-full" />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
