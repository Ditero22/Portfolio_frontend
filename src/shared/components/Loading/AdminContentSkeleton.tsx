type AdminContentSkeletonProps = {
  label: string;
  layout?: "table" | "list" | "responsive-table";
  rows?: number;
  columns?: number;
  tableMinWidth?: number;
};

export default function AdminContentSkeleton({
  label,
  layout = "table",
  rows = 5,
  columns = 5,
  tableMinWidth,
}: AdminContentSkeletonProps) {
  const columnCount = Math.max(3, columns);
  const showTable = layout !== "list";
  const showList = layout !== "table";
  const tableWidthStyle = tableMinWidth
    ? { minWidth: `${tableMinWidth}px` }
    : undefined;

  return (
    <div
      className={`admin-content-skeleton admin-content-skeleton--${layout}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading {label}…</span>

      {showTable && (
        <div
          className={`admin-content-skeleton__table ${layout === "responsive-table" ? "hidden md:block" : ""}`}
          aria-hidden="true"
        >
          <div
            className="admin-content-skeleton__header"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              ...tableWidthStyle,
            }}
          >
            {Array.from({ length: columnCount }, (_, index) => (
              <span
                key={index}
                className="admin-skeleton-block h-3 rounded-full"
                style={{ width: `${52 + ((index * 17) % 35)}%` }}
              />
            ))}
          </div>
          {Array.from({ length: rows }, (_, row) => (
            <div
              key={row}
              className="admin-content-skeleton__row"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                ...tableWidthStyle,
              }}
            >
              {Array.from({ length: columnCount }, (_, column) => (
                <span
                  key={column}
                  className={`admin-skeleton-block h-4 rounded-full ${column === 0 ? "max-w-40" : "max-w-28"}`}
                  style={{
                    width: `${column === 0 ? 76 : 38 + (((row + column) * 13) % 42)}%`,
                    animationDelay: `${(row * 45 + column * 35) % 450}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {showList && (
        <div
          className={`admin-content-skeleton__list ${layout === "responsive-table" ? "md:hidden" : ""}`}
          aria-hidden="true"
        >
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="admin-content-skeleton__list-row">
              <span className="admin-skeleton-block h-10 w-10 rounded-xl" />
              <span className="admin-content-skeleton__list-copy">
                <span className="admin-skeleton-block h-4 w-2/5 rounded-full" />
                <span className="admin-skeleton-block h-3 w-3/4 rounded-full" />
              </span>
              <span className="admin-content-skeleton__list-actions">
                <span className="admin-skeleton-block h-9 w-9 rounded-lg" />
                <span className="admin-skeleton-block h-9 w-9 rounded-lg" />
                <span className="admin-skeleton-block h-9 w-9 rounded-lg" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
