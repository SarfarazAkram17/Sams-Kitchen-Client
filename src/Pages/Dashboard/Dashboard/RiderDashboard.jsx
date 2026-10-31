import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { FiClock, FiDollarSign, FiPackage, FiTrendingUp } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../../../Components/Shared/EmptyState";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import {
  ChartTooltip,
  Donut,
  GradientDef,
  Key,
  KpiCard,
  LegendList,
  PageHeader,
  Panel,
  RankList,
  Segmented,
  StatusBadge,
  axisProps,
  cursorStyle,
  greeting,
  hasValues,
  minutesLabel,
  statusRows,
  taka,
  takaCompact,
  timeAgo,
  useGradientId,
} from "../../../Components/Charts/ChartKit";

const RANGES = [
  { value: 7, label: "7D" },
  { value: 14, label: "14D" },
  { value: 30, label: "30D" },
];

const RiderDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user, userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();
  const [range, setRange] = useState(30);
  const earningsGradient = useGradientId();

  const {
    data: stats = {},
    isLoading: statsLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["riderStats", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get("/stats/rider", { params: { email: userEmail } });
      return res.data;
    },
    enabled: !!userEmail && !roleLoading && role === "rider",
    refetchInterval: 30000,
  });

  const { data: rider, isLoading: riderLoading } = useQuery({
    queryKey: ["riderProfile", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/me", { params: { email: userEmail } });
      return res.data;
    },
    enabled: !!userEmail && !roleLoading && role === "rider",
    refetchInterval: 30000,
  });

  const availabilityMutation = useMutation({
    mutationFn: async (available) => {
      const res = await axiosSecure.patch(
        "/riders/me/availability",
        { available },
        { params: { email: userEmail } },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["riderProfile", userEmail], (previous) => ({
        ...previous,
        is_available: data.available,
        work_status: data.work_status,
      }));
      queryClient.invalidateQueries({ queryKey: ["riderOffers", userEmail] });
      toast.success(data.available ? "You are available for delivery offers." : "You are now unavailable.");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Availability could not be updated."),
  });

  if (statsLoading || riderLoading) return <Loading />;

  const daily = stats.daily || [];
  const dailyView = daily.slice(-range);
  const monthly = stats.monthly || [];
  const hourly = stats.hourly || [];
  const weekday = stats.weekday || [];
  const statusData = statusRows(stats.statusCounts);
  const topAreas = stats.topAreas || [];
  const recent = stats.recentDeliveries || [];
  const trends = stats.trends || {};

  const available = rider?.is_available !== false && rider?.work_status !== "unavailable";
  const delivering = rider?.work_status === "in_delivery";
  const activeDeliveries = (stats.pendingOrders || 0) + (stats.pickedOrders || 0);
  const firstName = (user?.displayName || userEmail?.split("@")[0] || "there").split(" ")[0];

  const peak = hourly.reduce((best, h) => (h.orders > (best?.orders || 0) ? h : best), null);
  const bestDay = weekday.reduce((best, d) => (d.earnings > (best?.earnings || 0) ? d : best), null);
  const walletTotal = (stats.pendingCashout || 0) + (stats.cashoutMoney || 0);

  return (
    <div className="w-full space-y-5 pb-10">
      <PageHeader
        eyebrow="Rider workspace"
        title={`${greeting()}, ${firstName}`}
        subtitle={
          rider?.thana
            ? `Delivery area: ${rider.thana}, ${rider.district}`
            : "Your delivery activity and earnings at a glance."
        }
        updatedAt={dataUpdatedAt}
      >
        <div className="flex flex-col gap-2 sm:items-end">
          <span
            className={`inline-flex items-center gap-2 text-sm font-semibold ${
              delivering ? "text-warning" : available ? "text-success" : "text-base-content/60"
            }`}
          >
            <span
              className={`size-2.5 rounded-full ${
                delivering ? "bg-warning" : available ? "bg-success" : "bg-base-content/40"
              }`}
            />
            {delivering ? "On a delivery" : available ? "Available for offers" : "Unavailable"}
          </span>
          <button
            type="button"
            aria-pressed={available}
            onClick={() => availabilityMutation.mutate(!available)}
            className={`btn btn-sm min-h-10 rounded-full px-5 ${
              available
                ? "border border-base-300 bg-base-200 text-base-content hover:border-error hover:text-error"
                : "bg-primary text-primary-content"
            }`}
          >
            {availabilityMutation.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : available ? (
              "Set unavailable"
            ) : (
              "Set available"
            )}
          </button>
        </div>
      </PageHeader>

      <section aria-label="Delivery summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total earnings"
          value={taka(stats.totalEarnings)}
          icon={<FiDollarSign />}
          color="var(--chart-1)"
          change={trends.earnings?.change}
          hint={`${taka(trends.earnings?.current)} last 30d`}
          series={daily}
          dataKey="earnings"
        />
        <KpiCard
          label="Completed deliveries"
          value={stats.completedOrders || 0}
          icon={<FiPackage />}
          color="var(--chart-2)"
          change={trends.deliveries?.change}
          hint={`${activeDeliveries} active now`}
          series={daily}
          dataKey="orders"
        />
        <KpiCard
          label="Avg. per delivery"
          value={taka(stats.avgEarningPerDelivery)}
          icon={<FiTrendingUp />}
          color="var(--chart-3)"
          hint={`${stats.totalOrders || 0} accepted overall`}
          meter={{ label: "Completion rate", value: Math.round(stats.completionRate || 0) }}
        />
        <KpiCard
          label="Avg. delivery time"
          value={minutesLabel(stats.avgDeliveryMinutes)}
          icon={<FiClock />}
          color="var(--chart-4)"
          hint={stats.fastestDeliveryMinutes ? `fastest ${minutesLabel(stats.fastestDeliveryMinutes)}` : "assigned → delivered"}
          meter={{
            label: "Cashed out",
            value: walletTotal > 0 ? Math.round(((stats.cashoutMoney || 0) / walletTotal) * 100) : 0,
          }}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Daily earnings"
          subtitle={`Delivery earnings and drops, last ${range} days`}
          action={<Segmented label="Date range" options={RANGES} value={range} onChange={setRange} />}
        >
          {hasValues(dailyView, ["earnings", "orders"]) ? (
            <>
              <Key
                items={[
                  { label: "Earnings (৳)", color: "var(--chart-1)" },
                  { label: "Deliveries", color: "var(--chart-2)" },
                ]}
              />
              <div className="dash-chart mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyView} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                    <defs>
                      <GradientDef id={earningsGradient} color="var(--chart-1)" from={0.4} />
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="label" {...axisProps} minTickGap={14} />
                    <YAxis yAxisId="amt" {...axisProps} tickFormatter={takaCompact} width={48} />
                    <YAxis yAxisId="cnt" orientation="right" hide />
                    <Tooltip
                      cursor={cursorStyle}
                      content={<ChartTooltip title={(p) => p.date} format={{ earnings: taka }} />}
                    />
                    <Bar
                      yAxisId="cnt"
                      dataKey="orders"
                      name="Deliveries"
                      fill="var(--chart-2)"
                      fillOpacity={0.55}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={18}
                    />
                    <Area
                      yAxisId="amt"
                      type="monotone"
                      dataKey="earnings"
                      name="Earnings"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      fill={`url(#${earningsGradient})`}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-base-100)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="No earnings in this window" description="Completed deliveries will chart here." />
          )}
        </Panel>

        <Panel title="Wallet" subtitle="Delivered orders only">
          {walletTotal > 0 ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-base-content/60">Ready to cash out</p>
                <p className="mt-1 text-4xl font-bold tabular-nums text-base-content">{taka(stats.pendingCashout)}</p>
              </div>
              <div>
                <div className="flex h-3 overflow-hidden rounded-full bg-base-200">
                  <div
                    className="h-full transition-[width] duration-700"
                    style={{ width: `${((stats.cashoutMoney || 0) / walletTotal) * 100}%`, background: "var(--color-success)" }}
                  />
                  <div
                    className="h-full transition-[width] duration-700"
                    style={{ width: `${((stats.pendingCashout || 0) / walletTotal) * 100}%`, background: "var(--chart-2)" }}
                  />
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-base-content/75">
                      <i className="size-2.5 rounded-full" style={{ background: "var(--color-success)" }} />
                      Cashed out
                    </span>
                    <span className="font-bold tabular-nums">{taka(stats.cashoutMoney)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-base-content/75">
                      <i className="size-2.5 rounded-full" style={{ background: "var(--chart-2)" }} />
                      Waiting
                    </span>
                    <span className="font-bold tabular-nums">{taka(stats.pendingCashout)}</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard/completedDeliveries"
                className="btn btn-primary btn-sm min-h-10 w-full rounded-full"
              >
                Go to completed deliveries
              </Link>
            </div>
          ) : (
            <EmptyState title="Nothing to cash out" description="Earnings from delivered orders will show up here." />
          )}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Monthly earnings" subtitle="Income and deliveries completed each month">
          {hasValues(monthly, ["earnings", "orders"]) ? (
            <>
              <Key
                items={[
                  { label: "Earnings (৳)", color: "var(--chart-1)" },
                  { label: "Deliveries", color: "var(--chart-3)" },
                ]}
              />
              <div className="dash-chart mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis yAxisId="amt" {...axisProps} tickFormatter={takaCompact} width={48} />
                    <YAxis yAxisId="cnt" orientation="right" hide />
                    <Tooltip
                      cursor={cursorStyle}
                      content={<ChartTooltip title={(p) => p.month} format={{ earnings: taka }} />}
                    />
                    <Bar yAxisId="amt" dataKey="earnings" name="Earnings" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={34} />
                    <Bar yAxisId="cnt" dataKey="orders" name="Deliveries" fill="var(--chart-3)" fillOpacity={0.7} radius={[6, 6, 0, 0]} maxBarSize={14} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="No earnings yet" description="Monthly earnings appear after your first completed delivery." />
          )}
        </Panel>

        <Panel
          title="Your busiest hours"
          subtitle={peak && peak.orders > 0 ? `You deliver most around ${peak.label}` : "Deliveries by hour, Dhaka time"}
        >
          {hasValues(hourly, ["orders"]) ? (
            <div className="dash-chart h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="hour" {...axisProps} interval={2} tickFormatter={(h) => `${h}h`} />
                  <YAxis {...axisProps} allowDecimals={false} width={40} />
                  <Tooltip cursor={cursorStyle} content={<ChartTooltip title={(p) => p.label} />} />
                  <Bar dataKey="orders" name="Deliveries" radius={[5, 5, 0, 0]}>
                    {hourly.map((h) => (
                      <Cell key={h.hour} fill="var(--chart-4)" fillOpacity={peak && h.hour === peak.hour ? 1 : 0.4} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No delivery pattern yet" description="Your busiest hours will show after a few deliveries." />
          )}
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Delivery status" subtitle="All orders assigned to you">
          {statusData.length ? (
            <>
              <Donut data={statusData} centerValue={stats.totalOrders || 0} centerLabel="assigned" height={200} />
              <LegendList data={statusData} />
            </>
          ) : (
            <EmptyState title="No deliveries yet" description="Accepted deliveries are summarized here." />
          )}
        </Panel>

        <Panel title="Top delivery areas" subtitle="Where you complete the most drops">
          {topAreas.length ? (
            <RankList
              items={topAreas}
              labelKey="area"
              valueKey="deliveries"
              format={(v) => `${v} drops`}
              sub={(a) => `${taka(a.earnings)} earned`}
              color="var(--chart-3)"
            />
          ) : (
            <EmptyState title="No areas yet" description="Areas rank here after completed deliveries." />
          )}
        </Panel>

        <Panel
          className="lg:col-span-2 xl:col-span-1"
          title="Recent deliveries"
          subtitle={bestDay && bestDay.earnings > 0 ? `${bestDay.day} is your best earning day` : "Your latest six"}
        >
          {recent.length ? (
            <ul className="divide-y divide-base-300">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-base-content">{order.customer}</p>
                    <p className="truncate text-xs text-base-content/60">
                      {order.area ? `${order.area} · ` : ""}
                      {order.items} {order.items === 1 ? "item" : "items"} · {timeAgo(order.deliveredAt || order.placedAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No deliveries yet" description="Your recent deliveries will be listed here." />
          )}
        </Panel>
      </section>
    </div>
  );
};

export default RiderDashboard;
