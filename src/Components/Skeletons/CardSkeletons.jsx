import { Skeleton } from "./Skeleton";

/* One skeleton per real card. Each repeats the wrapper classes and spacing of the
   card it stands in for, so nothing moves when the real content arrives. */

/* ------------------------------ Menu cards -------------------------------- */

export const FoodCardSkeleton = () => (
  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100">
    <div className="relative aspect-[1.3/1] overflow-hidden bg-base-200">
      <Skeleton className="absolute inset-0 rounded-none" />
      <Skeleton className="absolute left-3 top-3 h-6 w-20 rounded-full" />
      <Skeleton className="absolute bottom-3 left-3 h-6 w-28 rounded-full" />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <Skeleton className="h-[2.125rem] w-3/4" />
      <div className="mb-5 mt-2 min-h-10 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-base-300 pt-4">
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-1.5 h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 w-[4.75rem] rounded-full" />
        </div>
      </div>
    </div>
  </article>
);

// The large "today's pick" card in the home hero.
export const BannerDishSkeleton = () => (
  <div
    className="relative block w-full overflow-hidden rounded-[1.6rem] border border-base-300 bg-base-100 shadow-2xl shadow-black/15"
    role="status"
    aria-label="Loading featured dish"
  >
    <div className="relative aspect-[1.08/1] overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute left-4 top-4 h-7 w-28 rounded-full bg-black/25" />
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2.5 w-28 rounded bg-white/30" />
          <div className="h-7 w-3/4 rounded-md bg-white/30 sm:h-8" />
          <div className="h-3 w-full max-w-md rounded bg-white/25" />
          <div className="h-3 w-2/3 max-w-sm rounded bg-white/25" />
        </div>
        <div className="h-9 w-16 shrink-0 rounded-full bg-white/25 sm:h-10 sm:w-20" />
      </div>
    </div>
    <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-1.5 h-3 w-36" />
      </div>
      <Skeleton className="size-10 shrink-0 rounded-full" />
    </div>
  </div>
);

export const ReviewCardSkeleton = () => (
  <article className="rounded-lg border border-base-300 p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-20" />
    </div>
    <div className="my-5 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="size-20 rounded-lg" />
      <Skeleton className="size-20 rounded-lg" />
    </div>
  </article>
);

// Admin menu management card.
export const ManageFoodCardSkeleton = () => (
  <article className="surface-panel flex h-full flex-col overflow-hidden rounded-3xl shadow">
    <div className="relative aspect-[1.4/1] overflow-hidden bg-base-200">
      <Skeleton className="absolute inset-0 rounded-none" />
      <Skeleton className="absolute left-3 top-3 h-6 w-24 rounded-full" />
      <Skeleton className="absolute right-3 top-3 h-6 w-16 rounded-full" />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <Skeleton className="h-7 w-3/4" />
      <div className="mt-1.5 min-h-10 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-base-300 pt-4">
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-1.5 h-3 w-14" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  </article>
);

/* ----------------------------- Small list rows ----------------------------- */

export const NotificationItemSkeleton = () => (
  <article className="border-b border-base-300/70 px-4 py-3 last:border-0">
    <div className="flex gap-3">
      <Skeleton className="mt-1 size-7 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-3/4" />
        <Skeleton className="mt-2 h-[11px] w-32" />
      </div>
    </div>
  </article>
);

export const CartItemSkeleton = () => (
  <div className="flex items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200 p-2 pr-3">
    <div className="flex items-center">
      <Skeleton className="h-12 w-15 rounded-md sm:h-16 sm:w-20" />
      <div className="ml-4 space-y-1 px-0.5 sm:space-y-3">
        <Skeleton className="h-3.5 w-28 sm:h-4 sm:w-36" />
        <Skeleton className="h-5 w-20 rounded-md sm:h-6" />
      </div>
    </div>
    <Skeleton className="size-8 rounded-full" />
  </div>
);

export const SearchResultSkeleton = () => (
  <div className="flex items-center gap-3 rounded-lg p-2">
    <Skeleton className="size-12 shrink-0 rounded-lg" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

/* ------------------------------ Order pieces ------------------------------- */

const InfoBoxSkeleton = ({ titleWidth = "w-20", lines = 2 }) => (
  <section className="rounded-xl bg-base-200 p-3.5">
    <Skeleton className={`h-3 ${titleWidth}`} />
    <Skeleton className="mt-2 h-5 w-2/3" />
    {lines > 1 && <Skeleton className="mt-1.5 h-4 w-1/2" />}
  </section>
);

// "Food items" box: a header bar and a single scrolling row, as in the real list.
const ItemsBoxSkeleton = ({ className = "" }) => (
  <section
    className={`overflow-hidden rounded-xl border border-base-300 ${className}`}
  >
    <div className="flex items-center justify-between gap-3 bg-base-200 px-3.5 py-2.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-12" />
    </div>
    <div className="flex h-24 items-center gap-3 px-3 sm:px-3.5">
      <Skeleton className="size-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-14 shrink-0" />
    </div>
  </section>
);

// Kitchen card version: one item row plus a little extra room. The box grows to
// match the tallest card in its row, as the real one does.
const KitchenItemsBoxSkeleton = () => (
  <section className="flex flex-col overflow-hidden rounded-xl border border-base-300 sm:col-span-2">
    <div className="flex shrink-0 items-center justify-between gap-3 bg-base-200 px-3.5 py-2.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-12" />
    </div>
    <div className="min-h-[7.5rem] grow basis-0">
      <div className="flex h-24 items-center gap-3 px-3 sm:px-3.5">
        <Skeleton className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-14 shrink-0" />
      </div>
    </div>
  </section>
);

const OrderHeaderSkeleton = ({ badges = 1 }) => (
  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 bg-base-200/60 px-4 py-4 sm:px-5">
    <div className="min-w-0">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="mt-1.5 h-4 w-56 max-w-full" />
      <Skeleton className="mt-1.5 h-3 w-40" />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: badges }, (_, index) => (
        <Skeleton key={index} className="h-7 w-24 rounded-full" />
      ))}
    </div>
  </header>
);

const articleClass =
  "overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm";

export const KitchenOrderCardSkeleton = () => (
  <article className={`${articleClass} flex h-full flex-col`}>
    <OrderHeaderSkeleton />
    <div className="grid flex-1 grid-rows-[auto_auto_1fr] gap-3 p-4 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:p-5">
      <InfoBoxSkeleton titleWidth="w-20" />
      <InfoBoxSkeleton titleWidth="w-28" lines={1} />
      <KitchenItemsBoxSkeleton />
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </footer>
  </article>
);

export const DeliveryOfferCardSkeleton = () => (
  <article className={articleClass}>
    <OrderHeaderSkeleton />
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      <InfoBoxSkeleton titleWidth="w-20" />
      <InfoBoxSkeleton titleWidth="w-28" lines={1} />
      <ItemsBoxSkeleton className="sm:col-span-2" />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  </article>
);

export const ActiveDeliveryCardSkeleton = () => (
  <article className={articleClass}>
    <OrderHeaderSkeleton badges={2} />
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      <InfoBoxSkeleton titleWidth="w-20" />
      <InfoBoxSkeleton titleWidth="w-28" lines={1} />
      <ItemsBoxSkeleton className="sm:col-span-2" />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  </article>
);

export const CompletedDeliveryCardSkeleton = () => (
  <article className={articleClass}>
    <OrderHeaderSkeleton badges={2} />
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      <InfoBoxSkeleton titleWidth="w-20" />
      <InfoBoxSkeleton titleWidth="w-28" lines={1} />
      <InfoBoxSkeleton titleWidth="w-24" />
      <InfoBoxSkeleton titleWidth="w-20" />
    </div>
    <ItemsBoxSkeleton className="mx-4 mb-4 sm:mx-5" />
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 px-4 py-4 sm:px-5">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-1.5">
        <Skeleton className="ml-auto h-3 w-28" />
        <Skeleton className="ml-auto h-6 w-20" />
      </div>
    </footer>
  </article>
);

// A customer's own order: id, date and total in the header, price rows and two info boxes.
export const MyOrderCardSkeleton = () => (
  <article className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
    <header className="flex flex-col gap-4 border-b border-base-300 bg-base-200/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
        {[56, 28, 20].map((width, index) => (
          <div key={index} className="flex items-center gap-5">
            <div>
              <Skeleton className="h-2.5 w-14" />
              <Skeleton
                className={`mt-1.5 h-4 ${width === 56 ? "w-52" : width === 28 ? "w-28" : "w-16"}`}
              />
            </div>
            {index < 2 && (
              <span className="hidden h-8 w-px bg-base-300 sm:block" />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </header>
    <div className="p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="size-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-3 w-12" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        <div className="flex h-24 items-center gap-3 px-3 sm:px-3.5">
          <Skeleton className="size-16 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-14 shrink-0" />
        </div>
      </div>
      <div className="mt-3 space-y-2 border-t border-dashed border-base-300 pt-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
        <div className="flex justify-between border-t border-base-300 pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {[0, 1].map((box) => (
          <div
            key={box}
            className="rounded-2xl border border-base-300 bg-base-200/65 p-3.5"
          >
            <div className="flex items-start gap-2.5">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-1.5 h-4 w-1/2" />
                <Skeleton className="mt-1.5 h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </article>
);

const PayoutDetailsSkeleton = () => (
  <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
    {[0, 1, 2, 3].map((row) => (
      <div key={row} className="min-w-0">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-1.5 h-4 w-3/4" />
      </div>
    ))}
  </dl>
);

// Admin view of one rider's payout request.
export const CashoutRequestCardSkeleton = () => (
  <article className={articleClass}>
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 bg-base-200/60 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1.5 h-3 w-48 max-w-full" />
        <Skeleton className="mt-1.5 h-3 w-36" />
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-7 w-24" />
        <Skeleton className="ml-auto h-3 w-28" />
      </div>
    </header>
    <div className="space-y-4 p-4 sm:p-5">
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <PayoutDetailsSkeleton />
      </div>
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
      <Skeleton className="h-7 w-24 rounded-full" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </footer>
  </article>
);

// A rider's own past payout request.
export const CashoutHistoryCardSkeleton = () => (
  <article className={articleClass}>
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 bg-base-200/60 px-4 py-4 sm:px-5">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-1.5 h-3 w-44" />
      </div>
      <Skeleton className="h-7 w-24 rounded-full" />
    </header>
    <div className="space-y-4 p-4 sm:p-5">
      <PayoutDetailsSkeleton />
      <div className="space-y-3 border-t border-base-300 pt-4">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  </article>
);

/* ------------------------------ Dashboard pieces -------------------------- */

export const KpiCardSkeleton = () => (
  <article className="dash-kpi relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-32 max-w-full" />
      </div>
      <Skeleton className="size-10 shrink-0 rounded-2xl" />
    </div>
    <div className="mt-3 flex min-h-5 items-center gap-2">
      <Skeleton className="h-3 w-40 max-w-full" />
    </div>
    <div className="-mx-5 -mb-5 mt-auto pt-3">
      <div className="px-5 pb-5">
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  </article>
);

export const MiniStatSkeleton = () => (
  <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3.5">
    <Skeleton className="size-9 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="mt-1.5 h-3 w-full max-w-24" />
    </div>
  </div>
);

const panelClass =
  "dash-panel flex min-w-0 flex-col rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6";

// `action` is true for a button-sized placeholder, "tabs" for the range tabs
// (7D, 14D, 30D, 12M), or false for none.
const PanelHead = ({ action = true }) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
    </div>
    {action === "tabs" ? (
      <div className="flex flex-wrap gap-2">
        {["w-12", "w-12", "w-12", "w-14"].map((width, index) => (
          <Skeleton key={index} className={`h-10 rounded-full ${width}`} />
        ))}
      </div>
    ) : (
      action && <Skeleton className="h-9 w-40 rounded-full" />
    )}
  </div>
);

const barHeights = {
  daily: [38, 52, 30, 64, 46, 72, 58, 34, 80, 62, 44, 70, 50, 86],
  monthly: [48, 66, 40, 78, 58, 88],
  hourly: [
    10, 8, 6, 5, 6, 12, 22, 34, 48, 60, 72, 84, 90, 78, 66, 58, 62, 74, 88, 80,
    60, 40, 24, 14,
  ],
  weekday: [44, 60, 52, 70, 86, 94, 66],
};

// Faded bars on dashed gridlines, standing in for a chart that has not drawn yet.
const Bars = ({ heights, className = "h-72" }) => (
  <div className={`relative mt-3 w-full ${className}`}>
    <div
      className="absolute inset-0 flex flex-col justify-between"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((line) => (
        <span
          key={line}
          className="block border-t border-dashed border-base-300"
        />
      ))}
    </div>
    <div
      className="absolute inset-x-1 bottom-0 top-3 flex items-end gap-1.5 sm:gap-2"
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <div
          key={index}
          className="skeleton-block flex-1 rounded-b-none rounded-t-md"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  </div>
);

export const ChartPanelSkeleton = ({
  className = "",
  series = "daily",
  chartHeight = "h-72",
  legend = 2,
  rangeTabs = false,
}) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={rangeTabs ? "tabs" : true} />
    {legend > 0 && (
      <div className="flex items-center gap-4">
        {Array.from({ length: legend }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    )}
    <Bars heights={barHeights[series]} className={chartHeight} />
  </section>
);

export const DonutPanelSkeleton = ({ className = "", legend = 5 }) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <div className="flex flex-1 flex-col items-center gap-5">
      <div className="relative grid size-44 place-items-center">
        <Skeleton className="absolute inset-0 rounded-full" />
        <div className="relative grid size-28 place-items-center rounded-full bg-base-100">
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {Array.from({ length: legend }, (_, index) => (
          <li key={index} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
            </span>
            <Skeleton className="h-3.5 w-8" />
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export const RankListPanelSkeleton = ({ className = "", rows = 5 }) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <ol className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-10" />
            </div>
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export const WeekdayPanelSkeleton = ({
  className = "",
  chartHeight = "h-64",
}) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <Bars heights={barHeights.weekday} className={chartHeight} />
  </section>
);

export const HourlyPanelSkeleton = ({ className = "" }) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <Bars heights={barHeights.hourly} className="h-72" />
  </section>
);

// Latest orders as a plain list (customer and rider dashboards).
export const RecentOrdersPanelSkeleton = ({
  className = "",
  rows = 5,
  withIcon = false,
}) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <ul className="divide-y divide-base-300">
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          {withIcon && <Skeleton className="size-10 shrink-0 rounded-full" />}
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export const WalletPanelSkeleton = ({ className = "" }) => (
  <section className={`${panelClass} ${className}`}>
    <PanelHead action={false} />
    <div className="space-y-5">
      <div>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-10 w-32" />
      </div>
      <div>
        <Skeleton className="h-3 w-full rounded-full" />
        <ul className="mt-3 space-y-2">
          {[0, 1].map((row) => (
            <li key={row} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </span>
              <Skeleton className="h-3.5 w-14" />
            </li>
          ))}
        </ul>
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  </section>
);