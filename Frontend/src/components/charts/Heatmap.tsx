import { cn } from "@/lib/cn";

/**
 * Department x domain heatmap.
 *
 * Colour alone never carries the meaning: each cell prints its value, and the
 * whole grid is a real table so it is readable by screen readers and on a
 * monochrome print-out.
 */
export function Heatmap({
  rows, columns, cells, valueLabel = "Average level", max = 5,
}: {
  rows: string[];
  columns: Array<{ key: string; label: string }>;
  cells: Array<{ row: string; column: string; value: number; sublabel?: string }>;
  valueLabel?: string;
  max?: number;
}) {
  const lookup = new Map(cells.map((c) => [`${c.row}::${c.column}`, c]));

  const intensity = (value: number) => {
    const ratio = Math.max(0, Math.min(1, value / max));
    // A single hue ramp; lightness carries the magnitude.
    return `color-mix(in srgb, var(--color-primary-600) ${Math.round(ratio * 82)}%, transparent)`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">{valueLabel} by department and competency domain</caption>
        <thead>
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
              Department
            </th>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th scope="row" className="max-w-[16rem] truncate px-3 py-2 text-left text-sm font-medium text-foreground">
                {row}
              </th>
              {columns.map((col) => {
                const cell = lookup.get(`${row}::${col.key}`);
                const value = cell?.value ?? 0;
                return (
                  <td key={col.key} className="p-1">
                    <div
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-md border border-border-default text-xs font-semibold tabular-nums",
                        value / max > 0.55 ? "text-white" : "text-foreground",
                      )}
                      style={{ backgroundColor: intensity(value) }}
                      title={`${row} — ${col.label}: ${value.toFixed(2)}`}
                    >
                      <span>{value.toFixed(1)}</span>
                      {cell?.sublabel && <span className="font-normal opacity-80">{cell.sublabel}</span>}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
