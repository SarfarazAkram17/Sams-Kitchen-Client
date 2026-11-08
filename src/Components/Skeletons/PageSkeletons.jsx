import { Skeleton, SkeletonRegion } from "./Skeleton";
import {
  ActiveDeliveryCardSkeleton,
  CashoutHistoryCardSkeleton,
  CashoutRequestCardSkeleton,
  ChartPanelSkeleton,
  CompletedDeliveryCardSkeleton,
  DeliveryOfferCardSkeleton,
  DonutPanelSkeleton,
  FoodCardSkeleton,
  HourlyPanelSkeleton,
  KitchenOrderCardSkeleton,
  KpiCardSkeleton,
  ManageFoodCardSkeleton,
  MiniStatSkeleton,
  MyOrderCardSkeleton,
  RankListPanelSkeleton,
  RecentOrdersPanelSkeleton,
  ReviewCardSkeleton,
  WalletPanelSkeleton,
  WeekdayPanelSkeleton,
  BannerDishSkeleton,
} from "./CardSkeletons";

/* One skeleton per page. Headings reuse the page's wrapper classes. */

const foodGridClass = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";
const menuGridClass = `${foodGridClass} xl:grid-cols-4`;

/* ------------------------------ Shared heads ------------------------------ */

const SectionHeadingSkeleton = ({ action = true }) => (
  <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
    <div className="w-full max-w-xl">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="mt-3 h-11 w-3/4 sm:h-[3.25rem]" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
    {action && <Skeleton className="h-11 w-44 shrink-0 rounded-full" />}
  </div>
);

const DashboardHeaderSkeleton = ({ children }) => (
  <ListHeadingSkeleton lines={1} action="h-[1.875rem] w-44">
    {children}
  </ListHeadingSkeleton>
);

const KpiRowSkeleton = () => (
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {[0, 1, 2, 3].map((index) => (
      <KpiCardSkeleton key={index} />
    ))}
  </section>
);

// Heading used by list pages in the dashboard (eyebrow, title, note on the right).
// Mirrors PageHeading: every bar sits in a box as tall as the text line it stands in for.
// `lines` is how many lines the description wraps to, `back` adds the back link,
// `action` is the size of a button or badge on the right, and children go there too.
const ListHeadingSkeleton = ({
  action,
  lines = 2,
  back = false,
  className = "",
  children,
}) => (
  <header
    className={`dash-hero relative overflow-hidden rounded-3xl border border-base-300 p-5 sm:p-8 ${className}`}
  >
    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {back && (
          <div className="mb-4 flex h-6 items-center">
            <Skeleton className="h-4 w-40" />
          </div>
        )}
        <div className="flex h-4 items-center">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="mt-2 flex h-[2.34rem] items-center sm:h-[3.75rem]">
          <Skeleton className="h-8 w-3/4 max-w-lg sm:h-11" />
        </div>
        <div className="mt-2 max-w-xl">
          {Array.from({ length: lines }, (_, index) => (
            <div key={index} className="flex h-6 items-center">
              <Skeleton
                className={`h-3.5 ${index === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
              />
            </div>
          ))}
        </div>
      </div>
      {(action || children) && (
        <div className="flex flex-col gap-3 sm:items-end">
          {action && <Skeleton className={`rounded-full ${action}`} />}
          {children}
        </div>
      )}
    </div>
  </header>
);

/* --------------------------------- Home ----------------------------------- */

export const HomeSkeleton = () => (
  <SkeletonRegion label="Loading home">
    <section className="px-3 sm:px-4">
      <div className="hero-surface relative isolate mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] border border-base-300 sm:rounded-[2.5rem]">
        <div className="relative z-10 grid items-center gap-12 px-5 pb-24 pt-10 sm:px-10 sm:pt-14 lg:min-h-[600px] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-16 lg:pb-24">
          <div className="max-w-2xl">
            <Skeleton className="h-9 w-60 max-w-full rounded-full" />
            <Skeleton className="mt-6 h-12 w-full sm:h-20 lg:h-[4.9rem]" />
            <Skeleton className="mt-2 h-12 w-4/5 sm:h-20 lg:h-[4.9rem]" />
            <div className="mt-6 max-w-xl space-y-2.5">
              <Skeleton className="h-4 w-full sm:h-5" />
              <Skeleton className="h-4 w-full sm:h-5" />
              <Skeleton className="h-4 w-2/3 sm:h-5" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Skeleton className="h-[3.25rem] w-52 rounded-full" />
              <Skeleton className="h-[3.25rem] w-44 rounded-full" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
            <BannerDishSkeleton />
          </div>
        </div>
      </div>
    </section>

    <div className="relative z-10 mx-auto -mt-10 w-full max-w-6xl px-4 sm:-mt-12">
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-base-300 bg-base-300 shadow-xl shadow-black/10 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <li
            key={index}
            className="flex items-start gap-4 bg-base-100 p-5 sm:p-6"
          >
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>

    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-24">
      <SectionHeadingSkeleton />
      <div className={foodGridClass}>
        {[0, 1, 2].map((index) => (
          <FoodCardSkeleton key={index} />
        ))}
      </div>
    </section>

    <section className="band-warm border-y border-base-300 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeadingSkeleton />
        <div className={foodGridClass}>
          {[0, 1, 2].map((index) => (
            <FoodCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  </SkeletonRegion>
);

/* ------------------------------ Menu and offers --------------------------- */

const ListingHeaderSkeleton = () => (
  <header className="mb-8 border-b border-base-300 pb-7 text-center">
    <Skeleton className="mx-auto mb-2 h-3 w-44" />
    <Skeleton className="mx-auto h-11 w-72 max-w-full sm:h-14" />
    <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-full" />
  </header>
);

const FilterLabelBox = ({ className = "", label = "w-24" }) => (
  <div className={className}>
    <Skeleton className={`mb-1.5 h-3.5 ${label}`} />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

export const AllFoodsSkeleton = () => (
  <SkeletonRegion
    label="Loading menu"
    className="mx-auto mb-16 max-w-[1500px] px-4"
  >
    <ListingHeaderSkeleton />
    <section className="surface-panel mb-8 rounded-3xl p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <FilterLabelBox className="sm:col-span-2 lg:col-span-5" label="w-28" />
        <FilterLabelBox className="lg:col-span-3" label="w-16" />
        <FilterLabelBox className="lg:col-span-2" label="w-16" />
        <FilterLabelBox className="lg:col-span-2" label="w-16" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-4 w-20 sm:ml-auto" />
      </div>
    </section>
    <div className={menuGridClass}>
      {Array.from({ length: 8 }, (_, index) => (
        <FoodCardSkeleton key={index} />
      ))}
    </div>
  </SkeletonRegion>
);

export const OffersSkeleton = () => (
  <SkeletonRegion
    label="Loading offers"
    className="mx-auto mb-16 max-w-[1500px] px-4"
  >
    <ListingHeaderSkeleton />
    <section className="surface-panel mb-8 rounded-3xl p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <FilterLabelBox className="sm:col-span-2 lg:col-span-5" label="w-28" />
        <FilterLabelBox className="lg:col-span-3" label="w-16" />
        <FilterLabelBox className="lg:col-span-2" label="w-16" />
        <FilterLabelBox className="lg:col-span-2" label="w-16" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-12 w-full rounded-xl sm:w-52" />
        <Skeleton className="h-4 w-20 sm:ml-auto" />
      </div>
    </section>
    <div className={menuGridClass}>
      {Array.from({ length: 8 }, (_, index) => (
        <FoodCardSkeleton key={index} />
      ))}
    </div>
  </SkeletonRegion>
);

/* ------------------------------- Dish details ------------------------------ */

export const FoodDetailsSkeleton = () => (
  <SkeletonRegion
    label="Loading dish"
    className="mx-auto mb-16 max-w-[1500px] px-3"
  >
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <Skeleton className="h-64 w-full rounded-lg sm:h-80" />
        <div className="mt-5 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
          <div className="flex gap-2 pt-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="size-7 rounded-full!" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-5 w-32" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="h-11 w-32 rounded-lg" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>
    </div>
    <div className="mt-12">
      <Skeleton className="mx-auto mb-6 h-9 w-48" />
      <section className="dash-panel mb-6 rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-1.5 h-3.5 w-24" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="mb-2 mt-5 h-3.5 w-16" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mb-1.5 mt-5 h-3.5 w-28" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="mt-5 h-12 w-full rounded-full sm:w-48" />
      </section>
      <div className="mt-10 space-y-4">
        {[0, 1].map((index) => (
          <ReviewCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </SkeletonRegion>
);

/* ---------------------------- Checkout and payment ------------------------- */

const SummaryRowsSkeleton = ({ rows = 3 }) => (
  <>
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
    ))}
    <div className="space-y-2 border-t border-dashed border-base-300 pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  </>
);

export const CheckoutSkeleton = () => (
  <SkeletonRegion
    label="Loading checkout"
    className="mx-auto mb-16 flex max-w-[1500px] flex-col-reverse items-start justify-start gap-8 px-4 lg:flex-row lg:justify-center"
  >
    <div className="w-full space-y-4 rounded-xl p-0 lg:w-[62%]">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <FilterLabelBox key={index} label="w-24" />
        ))}
      </div>
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <FilterLabelBox key={index} label="w-16" />
        ))}
        <FilterLabelBox className="md:col-span-3" label="w-28" />
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
    <div className="w-full overflow-hidden rounded-xl bg-base-100 shadow-lg lg:w-[38%]">
      <div className="mb-4 flex items-center justify-between gap-1 rounded-t-xl bg-base-200 p-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="mb-6 space-y-3 px-4">
        <SummaryRowsSkeleton />
      </div>
    </div>
  </SkeletonRegion>
);

export const PaymentSkeleton = () => (
  <SkeletonRegion label="Loading payment" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton lines={1} />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between border-b bg-base-200/50 p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-3 p-4">
          <SummaryRowsSkeleton />
        </div>
      </div>
      <div className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  </SkeletonRegion>
);

// Mirrors OrderTracking.jsx class for class: same wrappers, same text line
// heights (every bar sits in a box as tall as the text line it stands in for)
// and the same tracking-steps timeline. `lines` lists the visibility of the
// 2nd and 3rd detail line, because the detail text wraps differently on phones,
// on tablets and desktops, and in the six-column row from 1280px.
const trackingSteps = [
  { lines: ["hidden", "hidden"], dated: true },
  { lines: ["flex sm:hidden xl:flex", "hidden xl:flex"], dated: true },
  { lines: ["flex sm:hidden xl:flex", "hidden xl:flex"], dated: false },
  { lines: ["flex sm:hidden xl:flex", "hidden xl:flex"], dated: false },
  { lines: ["flex sm:hidden xl:flex", "hidden"], dated: false },
  { lines: ["flex sm:hidden xl:flex", "hidden"], dated: false },
];

// One text line: the box has the line height, the bar is slightly shorter.
const TextLine = ({ box = "h-5", bar = "h-3.5 w-full", className = "" }) => (
  <div className={`flex items-center ${box} ${className}`}>
    <Skeleton className={bar} />
  </div>
);

const TrackingItemSkeleton = () => (
  <li className="flex h-24 items-center gap-3 px-3 sm:px-3.5">
    <Skeleton className="size-16 shrink-0 rounded-xl sm:size-[4.5rem]" />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <TextLine bar="h-3.5 w-40 max-w-full" />
        <TextLine box="h-4" bar="h-3 w-20" className="mt-0.5" />
      </div>
      <TextLine bar="h-3.5 w-16" className="shrink-0" />
    </div>
  </li>
);

const TrackingTotalRow = ({ left, right }) => (
  <div className="flex items-center justify-between">
    <TextLine bar={`h-3.5 ${left}`} />
    <TextLine bar={`h-3.5 ${right}`} />
  </div>
);

export const TrackingSkeleton = () => (
  <SkeletonRegion label="Loading order" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton back lines={1} action="h-[2.375rem] w-44" />

    <section
      className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8"
      aria-label="Order progress"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-24" />
          <div className="mt-1 flex h-7 items-center sm:h-8">
            <Skeleton className="h-5 w-48 sm:h-6" />
          </div>
        </div>
        <div className="flex h-10 flex-col justify-center gap-1.5">
          <Skeleton className="ml-auto h-3 w-12" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      <ol className="tracking-steps">
        {trackingSteps.map(({ lines, dated }, index) => (
          <li key={index} className="tracking-step">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 pb-7">
              <TextLine box="h-6" bar="h-4 w-32 max-w-full" />
              <div className="mt-1">
                <TextLine bar="h-3.5 w-11/12" />
                <TextLine bar="h-3.5 w-5/6" className={lines[0]} />
                <TextLine bar="h-3.5 w-2/3" className={lines[1]} />
              </div>
              {dated && <TextLine box="h-4" bar="h-3 w-28" className="mt-1" />}
            </div>
          </li>
        ))}
      </ol>
    </section>

    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
        <div className="flex items-center gap-2 border-b border-base-300 bg-base-200/70 px-5 py-4 sm:px-6">
          <Skeleton className="size-4 shrink-0 rounded" />
          <TextLine box="h-6" bar="h-4 w-28" />
        </div>
        <ul className="divide-y divide-base-300">
          {[0, 1].map((index) => (
            <TrackingItemSkeleton key={index} />
          ))}
        </ul>
        <div className="mx-5 mb-5 space-y-2 border-t border-base-300 pt-4 sm:mx-6">
          <TrackingTotalRow left="w-16" right="w-16" />
          <TrackingTotalRow left="w-14" right="w-12" />
          <div className="flex items-center justify-between border-t border-base-300 pt-3">
            <TextLine box="h-6" bar="h-4 w-12" />
            <TextLine box="h-6" bar="h-4 w-20" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded" />
          <TextLine box="h-6" bar="h-4 w-28" />
        </div>
        <TextLine box="h-6" bar="h-4 w-40 max-w-full" />
        <div className="mt-1">
          <TextLine box="h-6" bar="h-3.5 w-full" />
          <TextLine box="h-6" bar="h-3.5 w-2/3" />
        </div>
        <TextLine bar="h-3.5 w-28" className="mt-2" />
        <Skeleton className="mt-5 h-7 w-56 max-w-full rounded-full" />
      </section>
    </div>
  </SkeletonRegion>
);

/* -------------------------------- Dashboards ------------------------------- */

export const AdminDashboardSkeleton = () => (
  <SkeletonRegion
    label="Loading admin dashboard"
    className="w-full space-y-6 pb-8"
  >
    <DashboardHeaderSkeleton />
    <KpiRowSkeleton />
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <MiniStatSkeleton key={index} />
      ))}
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <ChartPanelSkeleton className="xl:col-span-2" series="daily" rangeTabs />
      <DonutPanelSkeleton legend={6} />
    </section>
    <section className="grid gap-5 xl:grid-cols-2">
      <ChartPanelSkeleton series="monthly" legend={3} />
      <HourlyPanelSkeleton />
    </section>
    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <RankListPanelSkeleton />
      <RankListPanelSkeleton />
      <WeekdayPanelSkeleton />
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <RecentOrdersPanelSkeleton className="xl:col-span-2" withIcon />
    </section>
  </SkeletonRegion>
);

export const CustomerDashboardSkeleton = () => (
  <SkeletonRegion
    label="Loading your dashboard"
    className="w-full space-y-6 pb-8"
  >
    <DashboardHeaderSkeleton>
      <Skeleton className="h-10 w-36 rounded-full" />
    </DashboardHeaderSkeleton>
    <KpiRowSkeleton />
    <section className="grid gap-5 xl:grid-cols-3">
      <ChartPanelSkeleton className="xl:col-span-2" series="monthly" />
      <DonutPanelSkeleton legend={5} />
    </section>
    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <RankListPanelSkeleton />
      <WeekdayPanelSkeleton />
      <RecentOrdersPanelSkeleton className="lg:col-span-2 xl:col-span-1" />
    </section>
  </SkeletonRegion>
);

export const RiderDashboardSkeleton = () => (
  <SkeletonRegion
    label="Loading rider dashboard"
    className="w-full space-y-6 pb-8"
  >
    <DashboardHeaderSkeleton>
      <Skeleton className="h-10 w-40 rounded-full" />
    </DashboardHeaderSkeleton>
    <KpiRowSkeleton />
    <section className="grid gap-5 xl:grid-cols-3">
      <ChartPanelSkeleton className="xl:col-span-2" series="daily" rangeTabs />
      <WalletPanelSkeleton />
    </section>
    <section className="grid gap-5 xl:grid-cols-2">
      <ChartPanelSkeleton series="monthly" />
      <HourlyPanelSkeleton />
    </section>
    <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <DonutPanelSkeleton legend={4} />
      <RankListPanelSkeleton />
      <RecentOrdersPanelSkeleton />
    </section>
  </SkeletonRegion>
);

// Shown while the dashboard does not yet know which role it is drawing for.
export const DashboardGateSkeleton = () => (
  <SkeletonRegion label="Loading dashboard" className="w-full space-y-6 pb-8">
    <DashboardHeaderSkeleton />
    <KpiRowSkeleton />
    <section className="grid gap-5 xl:grid-cols-3">
      <ChartPanelSkeleton className="xl:col-span-2" series="daily" />
      <DonutPanelSkeleton />
    </section>
  </SkeletonRegion>
);

/* ------------------------------- Order lists ------------------------------- */

export const KitchenOrdersListSkeleton = ({ count = 4 }) => (
  <SkeletonRegion
    label="Loading kitchen orders"
    className="grid gap-4 xl:grid-cols-2"
  >
    {Array.from({ length: count }, (_, index) => (
      <KitchenOrderCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const KitchenOrdersSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton />
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-10 w-36 rounded-full" />
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
    <KitchenOrdersListSkeleton />
  </div>
);

export const MyOrdersListSkeleton = ({ count = 3 }) => (
  <SkeletonRegion label="Loading your orders" className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <MyOrderCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const MyOrdersSkeleton = () => (
  <div className="w-full pb-8">
    <ListHeadingSkeleton className="mb-6" lines={1} action="h-5 w-36" />
    <div className="mb-6 flex flex-wrap gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-28 rounded-full" />
      ))}
    </div>
    <MyOrdersListSkeleton />
  </div>
);

export const PendingDeliveriesSkeleton = () => (
  <SkeletonRegion label="Loading deliveries" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton lines={1} />
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((index) => (
          <DeliveryOfferCardSkeleton key={index} />
        ))}
      </div>
    </section>
    <section className="space-y-4">
      <div>
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-2 h-3.5 w-56 max-w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ActiveDeliveryCardSkeleton />
      </div>
    </section>
  </SkeletonRegion>
);

export const CompletedDeliveriesListSkeleton = ({ count = 4 }) => (
  <SkeletonRegion
    label="Loading completed deliveries"
    className="grid gap-4 xl:grid-cols-2"
  >
    {Array.from({ length: count }, (_, index) => (
      <CompletedDeliveryCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const CompletedDeliveriesSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton />
    <CompletedDeliveriesListSkeleton />
  </div>
);

/* ------------------------------- Admin lists ------------------------------- */

// Heading panel used by Manage foods, Manage users and Pending riders.
// Search and filters panel (ListToolbar).
const ToolbarSkeleton = ({ filters = 3 }) => (
  <section className="surface-panel rounded-3xl p-4 sm:p-5">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
      <FilterLabelBox
        className={`sm:col-span-2 ${filters ? "lg:col-span-5" : "lg:col-span-12"}`}
        label="w-28"
      />
      {Array.from({ length: filters }, (_, index) => (
        <FilterLabelBox
          key={index}
          className={
            filters === 1
              ? "lg:col-span-7"
              : filters === 2
                ? "lg:col-span-3"
                : "lg:col-span-2"
          }
          label="w-20"
        />
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <Skeleton className="h-4 w-32" />
    </div>
  </section>
);

export const ManageFoodsGridSkeleton = ({ count = 6 }) => (
  <SkeletonRegion
    label="Loading menu"
    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
  >
    {Array.from({ length: count }, (_, index) => (
      <ManageFoodCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const ManageFoodsSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton action="h-11 w-36" />
    <ToolbarSkeleton />
    <ManageFoodsGridSkeleton />
  </div>
);

export const UsersListSkeleton = ({ rows = 8 }) => (
  <SkeletonRegion label="Loading users">
    <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 md:block">
      <table className="table w-full">
        <thead>
          <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
            <th className="w-14">#</th>
            <th>User</th>
            <th>Sign-in method</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              <td>
                <Skeleton className="h-4 w-5" />
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-48" />
                  </div>
                </div>
              </td>
              <td>
                <Skeleton className="h-4 w-28" />
              </td>
              <td>
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>
              <td>
                <Skeleton className="h-4 w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="space-y-3 md:hidden">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-300 bg-base-100 p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-full max-w-44" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonRegion>
);

export const ManageUsersSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton action="h-[2.375rem] w-32" />
    <div className="flex flex-wrap gap-2">
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-10 w-28 rounded-full" />
      ))}
    </div>
    <ToolbarSkeleton />
    <UsersListSkeleton />
  </div>
);

export const AllOrdersListSkeleton = ({ rows = 8 }) => (
  <SkeletonRegion label="Loading orders">
    <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 md:block">
      <table className="table w-full">
        <thead>
          <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
            <th>Order</th>
            <th>Customer</th>
            <th>Area</th>
            <th className="text-center">Items</th>
            <th className="text-right">Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              <td>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1.5 h-3.5 w-32" />
              </td>
              <td>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-1.5 h-3.5 w-24" />
              </td>
              <td>
                <Skeleton className="h-4 w-32" />
              </td>
              <td>
                <Skeleton className="mx-auto h-4 w-5" />
              </td>
              <td>
                <Skeleton className="ml-auto h-4 w-16" />
              </td>
              <td>
                <Skeleton className="h-7 w-20 rounded-full" />
              </td>
              <td>
                <Skeleton className="h-7 w-32 rounded-full" />
              </td>
              <td>
                <Skeleton className="size-9 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="space-y-3 md:hidden">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-300 bg-base-100 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-3.5 w-32" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="mt-3 h-10 w-full rounded-full" />
        </div>
      ))}
    </div>
  </SkeletonRegion>
);

export const AllOrdersSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton action="h-[2.375rem] w-32" />
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-28 rounded-full" />
      ))}
    </div>
    <ToolbarSkeleton filters={3} />
    <AllOrdersListSkeleton />
  </div>
);

export const RidersListSkeleton = ({ rows = 5 }) => (
  <SkeletonRegion label="Loading rider applications">
    <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 lg:block">
      <table className="table w-full">
        <thead>
          <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
            <th>Applicant</th>
            <th>Contact</th>
            <th>Delivery area</th>
            <th>Experience</th>
            <th>Applied</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              <td>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-44" />
                  </div>
                </div>
              </td>
              <td>
                <Skeleton className="h-4 w-24" />
              </td>
              <td>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1.5 h-3.5 w-20" />
              </td>
              <td>
                <Skeleton className="h-4 w-28" />
              </td>
              <td>
                <Skeleton className="h-4 w-24" />
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="size-10 rounded-full" />
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="space-y-3 lg:hidden">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-300 bg-base-100 p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-full max-w-44" />
            </div>
            <Skeleton className="size-10 rounded-full" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="col-span-2 h-9 w-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonRegion>
);

export const PendingRidersSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton action="h-[2.375rem] w-32" />
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
    <ToolbarSkeleton filters={2} />
    <RidersListSkeleton />
  </div>
);

export const CashoutRequestsListSkeleton = ({ count = 3 }) => (
  <SkeletonRegion label="Loading cashout requests" className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <CashoutRequestCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const CashoutRequestsSkeleton = () => (
  <div className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton />
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-10 w-28 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-28 rounded-full" />
    </div>
    <CashoutRequestsListSkeleton />
  </div>
);

/* ------------------------------ Rider cashouts ----------------------------- */

export const CashoutHistoryListSkeleton = ({ count = 2 }) => (
  <SkeletonRegion label="Loading cashout history" className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <CashoutHistoryCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const RiderCashoutsSkeleton = () => (
  <SkeletonRegion label="Loading cashouts" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton />
    <section className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-300 bg-base-100 p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-28" />
          <Skeleton className="mt-3 h-3 w-36" />
        </div>
      ))}
    </section>
    <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
      <div className="mt-5 space-y-5">
        <div>
          <Skeleton className="mb-2 h-4 w-28" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FilterLabelBox label="w-28" />
          <FilterLabelBox label="w-28" />
        </div>
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>
    </section>
    <section className="space-y-4">
      <Skeleton className="h-6 w-36" />
      <CashoutHistoryListSkeleton />
    </section>
  </SkeletonRegion>
);

/* ---------------------------------- Forms ---------------------------------- */

const FormHeaderSkeleton = ({ back = false }) => (
  <ListHeadingSkeleton back={back} lines={1} />
);

const FormSectionSkeleton = ({ children }) => (
  <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mb-5 mt-1.5 h-3.5 w-56 max-w-full" />
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const FormActionsSkeleton = ({ cancel = false }) => (
  <div className="flex flex-col-reverse gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 sm:flex-row sm:justify-end">
    {cancel && <Skeleton className="h-12 w-full rounded-full sm:w-32" />}
    <Skeleton className="h-12 w-full rounded-full sm:w-48" />
  </div>
);

const DishFormSections = ({ withImage }) => (
  <>
    <FormSectionSkeleton>
      <FilterLabelBox className="sm:col-span-2" label="w-24" />
      <div className="sm:col-span-2">
        <Skeleton className="mb-1.5 h-3.5 w-24" />
        <Skeleton className="h-[7.5rem] w-full rounded-xl" />
      </div>
    </FormSectionSkeleton>
    <FormSectionSkeleton>
      <FilterLabelBox label="w-20" />
      <FilterLabelBox label="w-24" />
      <Skeleton className="h-12 w-full rounded-2xl sm:col-span-2" />
    </FormSectionSkeleton>
    <FormSectionSkeleton>
      <div className="sm:col-span-2">
        <Skeleton className="mb-1.5 h-3.5 w-24" />
        {withImage ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/50 p-3 sm:flex-row sm:items-center">
            <Skeleton className="aspect-[4/3] w-full rounded-xl sm:w-52" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-60 max-w-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
          </div>
        ) : (
          <Skeleton className="h-44 w-full rounded-2xl" />
        )}
      </div>
      <FilterLabelBox className="sm:col-span-2" label="w-24" />
    </FormSectionSkeleton>
  </>
);

export const AddFoodSkeleton = () => (
  <SkeletonRegion label="Loading form" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton lines={1} />
    <div className="space-y-6">
      <DishFormSections />
      <FormActionsSkeleton />
    </div>
  </SkeletonRegion>
);

export const EditFoodSkeleton = () => (
  <SkeletonRegion label="Loading dish" className="w-full space-y-6 pb-8">
    <ListHeadingSkeleton back lines={1} />
    <div className="space-y-6">
      <DishFormSections withImage />
      <FormActionsSkeleton cancel />
    </div>
  </SkeletonRegion>
);

export const ProfileSkeleton = () => (
  <SkeletonRegion
    label="Loading profile"
    className="mx-auto w-full max-w-4xl space-y-6"
  >
    <FormHeaderSkeleton />
    <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <Skeleton className="size-36 shrink-0 rounded-full sm:size-40" />
        <div className="w-full flex-1 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl bg-base-200/60 px-4 py-3"
            >
              <Skeleton className="size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1.5 h-4 w-48 max-w-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </section>
  </SkeletonRegion>
);

/* ------------------------------ Auth and about ----------------------------- */

const AuthFrameSkeleton = ({ children, wide = false }) => (
  <SkeletonRegion label="Loading" className="auth-page">
    <aside className="auth-aside hidden flex-col justify-between p-10 lg:flex xl:p-14">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <Skeleton className="h-6 w-36" />
      </div>
      <Skeleton className="mx-auto h-[25rem] w-full max-w-[34rem] rounded-[2rem]" />
      <div>
        <Skeleton className="h-9 w-4/5 max-w-md" />
        <Skeleton className="mt-3 h-9 w-2/3 max-w-sm" />
        <Skeleton className="mt-4 h-4 w-64" />
      </div>
    </aside>
    <div className="flex min-w-0 flex-col px-4 py-5 sm:px-8">
      <header className="flex items-center justify-between">
        <Skeleton className="h-11 w-44 lg:invisible" />
        <Skeleton className="size-10 rounded-full" />
      </header>
      <main className="flex flex-1 items-center justify-center py-8">
        <section className={`auth-card ${wide ? "max-w-2xl" : "max-w-md"}`}>
          {children}
        </section>
      </main>
    </div>
  </SkeletonRegion>
);

export const RoleCardsSkeleton = () => (
  <div
    className="grid gap-3 sm:grid-cols-2"
    role="status"
    aria-label="Loading roles"
  >
    {[0, 1].map((index) => (
      <div key={index} className="role-card">
        <Skeleton className="size-11 shrink-0 rounded-[0.9rem]" />
        <div className="min-w-0 flex-1 space-y-2 pr-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const LoginSkeleton = () => (
  <AuthFrameSkeleton>
    <Skeleton className="h-10 w-56" />
    <Skeleton className="mt-3 h-4 w-full" />
    <div className="mt-7 space-y-4">
      <FilterLabelBox label="w-12" />
      <FilterLabelBox label="w-20" />
      <Skeleton className="h-12 w-full rounded-full" />
      <Skeleton className="mx-auto h-4 w-32" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  </AuthFrameSkeleton>
);

export const RegisterSkeleton = () => (
  <AuthFrameSkeleton wide>
    <Skeleton className="h-10 w-72 max-w-full" />
    <Skeleton className="mt-3 h-4 w-full" />
    <div className="mt-7 space-y-5">
      <Skeleton className="h-4 w-16" />
      <RoleCardsSkeleton />
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full!" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-52 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterLabelBox label="w-20" />
        <FilterLabelBox label="w-12" />
      </div>
      <FilterLabelBox label="w-20" />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  </AuthFrameSkeleton>
);

export const OnboardingSkeleton = () => (
  <AuthFrameSkeleton wide>
    <Skeleton className="h-10 w-80 max-w-full" />
    <Skeleton className="mt-3 h-4 w-64 max-w-full" />
    <div className="mt-7 space-y-6">
      <RoleCardsSkeleton />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  </AuthFrameSkeleton>
);

export const AboutSkeleton = () => (
  <SkeletonRegion
    label="Loading about page"
    className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 mb-16"
  >
    <header className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-200 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
      <div className="relative max-w-3xl">
        <Skeleton className="mb-5 h-3 w-40" />
        <Skeleton className="h-11 w-full max-w-2xl sm:h-16" />
        <Skeleton className="mt-2 h-11 w-3/4 max-w-xl sm:h-16" />
        <Skeleton className="mt-6 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-lg" />
        <Skeleton className="mt-8 h-12 w-44 rounded-full" />
      </div>
    </header>
    <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-10 w-4/5 max-w-md sm:h-12" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton
            key={index}
            className={`h-4 ${index % 2 ? "w-11/12" : "w-full"}`}
          />
        ))}
      </div>
    </div>
    <div className="grid gap-4 border-y border-base-300 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10">
      {[0, 1, 2].map((index) => (
        <div key={index}>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
      ))}
    </div>
  </SkeletonRegion>
);

/* ------------------------- Rejected rider application ---------------------- */

export const RiderRejectedSkeleton = () => (
  <SkeletonRegion
    label="Loading your application"
    className="w-full space-y-6 pb-8"
  >
    <ListHeadingSkeleton lines={1} />
    <section className="flex items-start gap-3 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <Skeleton className="mt-0.5 size-[22px] shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-2/3" />
      </div>
    </section>
    <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mb-5 mt-1.5 h-3.5 w-80 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterLabelBox label="w-28" />
        <FilterLabelBox label="w-12" />
        <FilterLabelBox className="sm:col-span-2" label="w-44" />
        <FilterLabelBox label="w-16" />
        <FilterLabelBox label="w-16" />
        <FilterLabelBox className="sm:col-span-2" label="w-36" />
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-full" />
    </section>
    <Skeleton className="mx-auto h-10 w-60 rounded-full" />
  </SkeletonRegion>
);

/* ------------------------------ 404 and 403 pages -------------------------- */

const StatusFrameSkeleton = ({ titleWidth, lines, buttons }) => (
  <SkeletonRegion
    label="Loading"
    className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-24"
  >
    <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="size-10 rounded-full" />
    </header>
    <main className="text-center">
      <div className="flex justify-center gap-1 sm:gap-3">
        {[0, 1, 2].map((index) => (
          <Skeleton
            key={index}
            className="h-[clamp(4.3rem,21vw,12.3rem)] w-[clamp(2.8rem,13.5vw,7.9rem)] rounded-2xl"
          />
        ))}
      </div>
      <Skeleton className={`mx-auto mt-12 h-9 sm:h-10 ${titleWidth}`} />
      <div className="mx-auto mt-4 max-w-md space-y-2">
        {lines.map((width, index) => (
          <Skeleton key={index} className={`mx-auto h-4 ${width}`} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {buttons.map((width, index) => (
          <Skeleton
            key={index}
            className={`h-12 w-full rounded-full sm:w-auto sm:min-w-44 ${width}`}
          />
        ))}
      </div>
    </main>
  </SkeletonRegion>
);

// 404: "Page not found", a short explanation, then Back to home and Open dashboard.
export const ErrorPageSkeleton = () => (
  <StatusFrameSkeleton
    titleWidth="w-60"
    lines={["w-full", "w-11/12", "w-2/3"]}
    buttons={["", ""]}
  />
);

// 403: "You can't open this page", then Back to home and Open dashboard or Sign in.
export const ForbiddenSkeleton = () => (
  <StatusFrameSkeleton
    titleWidth="w-80 max-w-full"
    lines={["w-full", "w-full", "w-1/2"]}
    buttons={["", ""]}
  />
);

/* ------------------------------ Dish grids -------------------------------- */

// Cards-only grid for sections that load their own data (home sections, menu pages).
export const FoodGridSkeleton = ({ count = 8, className = menuGridClass }) => (
  <SkeletonRegion label="Loading dishes" className={className}>
    {Array.from({ length: count }, (_, index) => (
      <FoodCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
);

export const HomeFoodGridSkeleton = () => (
  <FoodGridSkeleton count={3} className={foodGridClass} />
);