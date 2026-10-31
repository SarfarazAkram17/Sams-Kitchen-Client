import { useId } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";

/* -------------------------------------------------------------------------- */
/* Palette + formatters                                                       */
/* -------------------------------------------------------------------------- */

export const STATUS_META = {
  pending: { label: "Pending payment", color: "var(--status-pending)" },
  confirmed: { label: "Preparing", color: "var(--status-confirmed)" },
  prepared: { label: "Prepared", color: "var(--status-prepared)" },
  assigned: { label: "Rider assigned", color: "var(--status-assigned)" },
  picked: { label: "On the way", color: "var(--status-picked)" },
  delivered: { label: "Delivered", color: "var(--status-delivered)" },
  cancelled: { label: "Cancelled", color: "var(--status-cancelled)" },
};

export const statusRows = (counts = {}) =>
  Object.entries(STATUS_META)
    .map(([key, meta]) => ({
      key,
      name: meta.label,
      value: Number(counts[key] || 0),
      color: meta.color,
    }))
    .filter((row) => row.value > 0);

export const taka = (n) =>
  `৳${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const compact = (n) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(n || 0),
  );

export const takaCompact = (n) => `৳${compact(n)}`;

export const minutesLabel = (minutes) => {
  const m = Number(minutes || 0);
  if (!m) return "—";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
};

export const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const greeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date()),
  );
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

/* -------------------------------------------------------------------------- */
/* Layout primitives                                                          */
/* -------------------------------------------------------------------------- */

export const PageHeader = ({ eyebrow, title, subtitle, updatedAt, children }) => (
  <header className="dash-hero relative overflow-hidden rounded-3xl border border-base-300 p-6 sm:p-8">
    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>
        <h1
          className="mt-2 text-4xl leading-tight text-base-content sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/65">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        {updatedAt ? <LiveBadge updatedAt={updatedAt} /> : null}
        {children}
      </div>
    </div>
  </header>
);

export const LiveBadge = ({ updatedAt }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 text-xs font-medium text-base-content/70 backdrop-blur">
    <span className="relative flex size-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
    Live · updated{" "}
    {new Date(updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
  </span>
);

export const Panel = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`dash-panel flex min-w-0 flex-col rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6 ${className}`}>
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-base-content">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-base-content/60">{subtitle}</p>}
      </div>
      {action}
    </header>
    <div className="min-h-0 flex-1">{children}</div>
  </section>
);

export const Segmented = ({ options, value, onChange, label }) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex rounded-full border border-base-300 bg-base-200/60 p-0.5 text-xs"
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={`rounded-full px-3 py-1 font-semibold transition-colors ${
          value === option.value
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/65 hover:text-base-content"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const Key = ({ items }) => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/70">
    {items.map((item) => (
      <li key={item.label} className="flex items-center gap-1.5">
        <i className="size-2.5 rounded-full" style={{ background: item.color }} />
        {item.label}
      </li>
    ))}
  </ul>
);

export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status || "Unknown", color: "var(--color-base-content)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      <i className="size-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* KPI card                                                                   */
/* -------------------------------------------------------------------------- */

export const Delta = ({ change, label = "vs prev. 30 days" }) => {
  if (change === undefined) return null;
  if (change === null) {
    return <span className="text-xs text-base-content/55">No prior period to compare</span>;
  }
  const up = change > 0;
  const flat = change === 0;
  const Icon = flat ? FiMinus : up ? FiArrowUpRight : FiArrowDownRight;
  const tone = flat ? "var(--color-base-content)" : up ? "var(--color-success)" : "var(--color-error)";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold tabular-nums"
        style={{ color: tone, background: `color-mix(in srgb, ${tone} 14%, transparent)` }}
      >
        <Icon aria-hidden="true" />
        {Math.abs(change)}%
      </span>
      <span className="text-base-content/55">{label}</span>
    </span>
  );
};

export const KpiCard = ({
  label,
  value,
  icon,
  color = "var(--chart-1)",
  change,
  changeLabel,
  hint,
  series,
  dataKey,
  meter,
}) => {
  const uid = useUid();
  const hasSeries = Array.isArray(series) && series.some((point) => Number(point[dataKey]) > 0);

  return (
    <article className="dash-kpi relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-base-content/60">{label}</p>
          <p className="mt-2 truncate text-3xl font-bold tabular-nums text-base-content">{value}</p>
        </div>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-2xl text-lg"
          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {change !== undefined && <Delta change={change} label={changeLabel} />}
        {hint && <span className="text-base-content/60">{hint}</span>}
      </div>

      <div className="-mx-5 -mb-5 mt-auto pt-3">
        {meter ? (
          <div className="px-5 pb-5">
            <div className="mb-1.5 flex justify-between text-[11px] font-medium text-base-content/60">
              <span>{meter.label}</span>
              <span className="tabular-nums text-base-content">{meter.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${Math.min(100, Math.max(0, meter.value))}%`, background: color }}
              />
            </div>
          </div>
        ) : (
          <div className="h-14">
            {hasSeries && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
                      <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#${uid})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export const MiniStat = ({ label, value, hint, icon }) => (
  <article className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3.5">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200 text-base text-base-content/75">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="truncate text-lg font-bold leading-tight tabular-nums text-base-content">{value}</p>
      <p className="truncate text-xs text-base-content/60">
        {label}
        {hint ? ` · ${hint}` : ""}
      </p>
    </div>
  </article>
);

/* -------------------------------------------------------------------------- */
/* Chart pieces                                                               */
/* -------------------------------------------------------------------------- */

export const ChartTooltip = ({ active, payload, label, format = {}, title }) => {
  if (!active || !payload?.length) return null;
  const heading = title ? title(payload[0].payload) : label;
  return (
    <div className="min-w-36 rounded-xl border border-base-300 bg-base-100/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur">
      {heading ? <p className="mb-1.5 font-bold text-base-content">{heading}</p> : null}
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = entry.dataKey;
          const render = format[key] || ((v) => Number(v).toLocaleString());
          const swatch = entry.color || entry.payload?.color || entry.payload?.fill;
          return (
            <div key={`${key}-${entry.name}`} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-base-content/70">
                <i className="size-2 rounded-full" style={{ background: swatch }} />
                {entry.name}
              </span>
              <span className="font-bold tabular-nums text-base-content">{render(entry.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const cursorStyle = { fill: "color-mix(in srgb, var(--color-base-content) 6%, transparent)" };

export const Donut = ({ data, centerValue, centerLabel, height = 220 }) => (
  <div className="relative" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="68%"
          outerRadius="94%"
          paddingAngle={data.length > 1 ? 3 : 0}
          cornerRadius={6}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
      <div>
        <p className="text-3xl font-bold tabular-nums text-base-content">{centerValue}</p>
        <p className="text-xs text-base-content/60">{centerLabel}</p>
      </div>
    </div>
  </div>
);

export const LegendList = ({ data }) => {
  const total = data.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <ul className="mt-4 space-y-2.5 text-sm">
      {data.map((row) => (
        <li key={row.name} className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-base-content/80">
            <i className="size-2.5 shrink-0 rounded-full" style={{ background: row.color }} />
            <span className="truncate">{row.name}</span>
          </span>
          <span className="shrink-0 font-semibold tabular-nums text-base-content">
            {row.value}
            <span className="ml-2 text-xs font-normal text-base-content/50">
              {Math.round((row.value / total) * 100)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export const RankList = ({ items, labelKey, valueKey, format = (v) => v, sub, color = "var(--chart-1)" }) => {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item[labelKey]}-${index}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-base-200 text-[11px] font-bold text-base-content/70">
                {index + 1}
              </span>
              <span className="truncate font-medium text-base-content">{item[labelKey]}</span>
            </span>
            <span className="shrink-0 font-bold tabular-nums text-base-content">{format(item[valueKey])}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${((Number(item[valueKey]) || 0) / max) * 100}%`,
                background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, var(--color-secondary)))`,
              }}
            />
          </div>
          {sub ? <p className="mt-1 text-xs text-base-content/55">{sub(item)}</p> : null}
        </li>
      ))}
    </ol>
  );
};

export const GradientDef = ({ id, color, from = 0.35 }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" style={{ stopColor: color, stopOpacity: from }} />
    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
  </linearGradient>
);

export const useGradientId = useUid;

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11 },
};

export const hasValues = (rows = [], keys = []) =>
  rows.some((row) => keys.some((key) => Number(row[key]) > 0));
