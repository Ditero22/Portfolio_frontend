import type { ReactNode } from "react";

interface TableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyMessage?: string;
}

function Table<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No data found.",
}: TableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-ink/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/[0.03]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-normal uppercase tracking-wider text-ink/40"
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
              data.map((item) => (
                <tr
                  key={getRowKey(item)}
                  className="border-b border-ink/10 last:border-b-0 transition hover:bg-ink/[0.02]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-4 text-sm text-ink/70"
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
