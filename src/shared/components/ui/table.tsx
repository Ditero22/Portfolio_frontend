import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render: (item: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  minWidthClassName?: string;
  renderMobileItem?: (item: T, index: number) => ReactNode;
  mobileEmptyMessage?: string;
}

function Table<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No data found.",
  ariaLabel = "Data table",
  className = "",
  minWidthClassName = "min-w-[640px]",
  renderMobileItem,
  mobileEmptyMessage = emptyMessage,
}: TableProps<T>) {
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`admin-table-shell ${renderMobileItem ? "hidden md:block" : ""}`}
      >
        <div
          className="admin-table-scroll overflow-x-auto"
          role="region"
          aria-label={`${ariaLabel}; scroll horizontally for more columns`}
          tabIndex={0}
        >
          <table className={`admin-data-table w-full border-collapse ${minWidthClassName}`}>
            <caption className="sr-only">{ariaLabel}</caption>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55 ${column.headerClassName ?? ""}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-ink/40"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={getRowKey(item)}
                    className="transition-colors hover:bg-ink/[0.035]"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3.5 text-sm text-ink/75 ${column.cellClassName ?? ""}`}
                      >
                        {column.render(item, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderMobileItem && (
        <div className="grid gap-3 md:hidden">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-surface p-8 text-center text-sm text-ink/55">
              {mobileEmptyMessage}
            </div>
          ) : (
            data.map((item, index) => (
              <div key={getRowKey(item)}>{renderMobileItem(item, index)}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Table;
