import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiClock, FiDollarSign, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import { FaMotorcycle, FaUserAlt } from "react-icons/fa";
import { IoFastFoodOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import Loading from "../../../Components/Loading/Loading";
import EmptyState from "../../../Components/Shared/EmptyState";
import {
  ChartTooltip,
  Donut,
  GradientDef,
  Key,
  KpiCard,
  LegendList,
  MiniStat,
  PageHeader,
  Panel,
  RankList,
  Segmented,
  StatusBadge,
  axisProps,
  compact,
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

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { user, userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();
  const [range, setRange] = useState(30);
  const revenueGradient = useGradientId();

  const {
    data: stats = {},
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/stats/admin?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "admin",
    refetchInterval: 30000,
  });

  if (isLoading) return <Loading />;

  const daily = stats.daily || [];
  const dailyView = daily.slice(-range);
  const monthly = (stats.monthly || []).map((m) => ({
    ...m,
    inProgress: Math.max(0, m.orders - m.delivered - m.cancelled),
  }));
  const hourly = stats.hourly || [];
  const weekday = stats.weekday || [];
  const statusData = statusRows(stats.statusCounts);
  const topFoods = stats.topFoods || [];
  const topAreas = stats.topAreas || [];
  const topRiders = stats.topRiders || [];
  const recentOrders = stats.recentOrders || [];
  const trends = stats.trends || {};
  const customers = (stats.userRoles || []).find((r) => r.role === "customer")?.count || 0;

  const peak = hourly.reduce((best, h) => (h.orders > (best?.orders || 0) ? h : best), null);
  const peakDay = weekday.reduce((best, d) => (d.revenue > (best?.revenue || 0) ? d : best), null);
  const firstName = (user?.displayName || userEmail?.split("@")[0] || "there").split(" ")[0];

  return (
    <div className="w-full space-y-5 pb-10">
      <PageHeader
        eyebrow="Admin overview"
        title={`${greeting()}, ${firstName}`}
        subtitle="Revenue, orders and delivery performance across Sam’s Kitchen — refreshed automatically."
        updatedAt={dataUpdatedAt}
      />

      {/* Headline KPIs */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={taka(stats.totalPayments)}
          icon={<FiDollarSign />}
          color="var(--chart-1)"
          change={trends.revenue?.change}
          hint={`${taka(trends.revenue?.current)} last 30d`}
          series={daily}
          dataKey="revenue"
        />
        <KpiCard
          label="Orders"
          value={Number(stats.totalOrders || 0).toLocaleString()}
          icon={<FiShoppingBag />}
          color="var(--chart-2)"
          change={trends.orders?.change}
          hint={`${trends.orders?.current ?? 0} last 30d`}
          series={daily}
          dataKey="orders"
        />
        <KpiCard
          label="Avg. order value"
          value={taka(stats.avgOrderValue)}
          icon={<FiTrendingUp />}
          color="var(--chart-3)"
          hint={`${stats.paidOrders || 0} paid orders`}
          meter={{ label: "Orders paid", value: Math.round(stats.paymentRate || 0) }}
        />
        <KpiCard
          label="Avg. delivery time"
          value={minutesLabel(stats.avgDeliveryMinutes)}
          icon={<FiClock />}
          color="var(--chart-4)"
          hint="order placed → delivered"
          meter={{ label: "Orders delivered", value: Math.round(stats.deliveryRate || 0) }}
        />
      </section>

      <section aria-label="Platform snapshot" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={<FaUserAlt />} label="Users" value={stats.totalUsers || 0} hint={`${customers} customers`} />
        <MiniStat icon={<FaMotorcycle />} label="Riders" value={stats.totalRiders || 0} />
        <MiniStat icon={<IoFastFoodOutline />} label="Menu items" value={stats.totalFoods || 0} />
        <MiniStat
          icon={<MdOutlineCancel />}
          label="Cancellation rate"
          value={`${stats.cancellationRate || 0}%`}
          hint={`${stats.cancelledOrders || 0} orders`}
        />
      </section>

      {/* Revenue + status */}
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Revenue & orders"
          subtitle={`Daily paid revenue and orders placed, last ${range} days`}
          action={<Segmented label="Date range" options={RANGES} value={range} onChange={setRange} />}
        >
          {hasValues(dailyView, ["revenue", "orders"]) ? (
            <>
              <Key
                items={[
                  { label: "Revenue (৳)", color: "var(--chart-1)" },
                  { label: "Orders", color: "var(--chart-2)" },
                ]}
              />
              <div className="dash-chart mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyView} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                    <defs>
                      <GradientDef id={revenueGradient} color="var(--chart-1)" from={0.4} />
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="label" {...axisProps} minTickGap={14} />
                    <YAxis yAxisId="rev" {...axisProps} tickFormatter={takaCompact} width={52} />
                    <YAxis yAxisId="ord" orientation="right" hide />
                    <Tooltip
                      cursor={cursorStyle}
                      content={
                        <ChartTooltip
                          title={(p) => p.date}
                          format={{ revenue: taka, orders: (v) => v }}
                        />
                      }
                    />
                    <Bar
                      yAxisId="ord"
                      dataKey="orders"
                      name="Orders"
                      fill="var(--chart-2)"
                      fillOpacity={0.55}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={18}
                    />
                    <Area
                      yAxisId="rev"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      fill={`url(#${revenueGradient})`}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-base-100)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="No activity in this window" description="Paid revenue and new orders will chart here as they arrive." />
          )}
        </Panel>

        <Panel title="Orders by status" subtitle="Where every order is right now">
          {statusData.length ? (
            <>
              <Donut data={statusData} centerValue={stats.totalOrders || 0} centerLabel="total orders" />
              <LegendList data={statusData} />
            </>
          ) : (
            <EmptyState title="No orders yet" description="Order activity will appear here when customers place orders." />
          )}
        </Panel>
      </section>

      {/* Monthly + hourly */}
      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Monthly performance" subtitle="Order outcomes with paid revenue overlay">
          {hasValues(monthly, ["orders", "revenue"]) ? (
            <>
              <Key
                items={[
                  { label: "Delivered", color: "var(--color-success)" },
                  { label: "In progress", color: "var(--chart-2)" },
                  { label: "Cancelled", color: "var(--color-error)" },
                  { label: "Revenue", color: "var(--chart-1)" },
                ]}
              />
              <div className="dash-chart mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis yAxisId="ord" {...axisProps} allowDecimals={false} width={40} />
                    <YAxis yAxisId="rev" orientation="right" hide />
                    <Tooltip
                      cursor={cursorStyle}
                      content={
                        <ChartTooltip
                          title={(p) => p.month}
                          format={{ revenue: taka }}
                        />
                      }
                    />
                    <Bar yAxisId="ord" dataKey="delivered" name="Delivered" stackId="o" fill="var(--color-success)" maxBarSize={34} />
                    <Bar yAxisId="ord" dataKey="inProgress" name="In progress" stackId="o" fill="var(--chart-2)" maxBarSize={34} />
                    <Bar yAxisId="ord" dataKey="cancelled" name="Cancelled" stackId="o" fill="var(--color-error)" radius={[6, 6, 0, 0]} maxBarSize={34} />
                    <Line
                      yAxisId="rev"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, stroke: "var(--color-base-100)", fill: "var(--chart-1)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="No order history yet" description="Monthly performance will appear as orders come in." />
          )}
        </Panel>

        <Panel
          title="When customers order"
          subtitle={peak && peak.orders > 0 ? `Peak hour is ${peak.label} (${peak.orders} orders)` : "Orders by hour of day, Dhaka time"}
        >
          {hasValues(hourly, ["orders"]) ? (
            <div className="dash-chart h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="hour" {...axisProps} interval={2} tickFormatter={(h) => `${h}h`} />
                  <YAxis {...axisProps} allowDecimals={false} width={40} />
                  <Tooltip cursor={cursorStyle} content={<ChartTooltip title={(p) => p.label} />} />
                  <Bar dataKey="orders" name="Orders" radius={[5, 5, 0, 0]}>
                    {hourly.map((h) => (
                      <Cell
                        key={h.hour}
                        fill="var(--chart-1)"
                        fillOpacity={peak && h.hour === peak.hour ? 1 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No ordering pattern yet" description="Hourly demand will show once orders are placed." />
          )}
        </Panel>
      </section>

      {/* Rankings */}
      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Top dishes" subtitle="By quantity ordered (cancelled orders excluded)">
          {topFoods.length ? (
            <RankList
              items={topFoods}
              labelKey="name"
              valueKey="quantity"
              format={(v) => `${v} sold`}
              sub={(f) => `${taka(f.revenue)} in sales`}
              color="var(--chart-1)"
            />
          ) : (
            <EmptyState title="No popular dishes yet" description="Your most ordered dishes will appear here." />
          )}
        </Panel>

        <Panel title="Top delivery areas" subtitle="Thanas with the most orders">
          {topAreas.length ? (
            <RankList
              items={topAreas}
              labelKey="area"
              valueKey="orders"
              format={(v) => `${v} orders`}
              sub={(a) => `${taka(a.revenue)} paid revenue`}
              color="var(--chart-3)"
            />
          ) : (
            <EmptyState title="No delivery areas yet" description="Areas will rank once orders include a delivery address." />
          )}
        </Panel>

        <Panel
          className="lg:col-span-2 xl:col-span-1"
          title="Revenue by weekday"
          subtitle={peakDay && peakDay.revenue > 0 ? `${peakDay.day} is your strongest day` : "Paid revenue by day of week"}
        >
          {hasValues(weekday, ["revenue"]) ? (
            <div className="dash-chart h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekday} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="day" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={takaCompact} width={48} />
                  <Tooltip cursor={cursorStyle} content={<ChartTooltip format={{ revenue: taka }} />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {weekday.map((d) => (
                      <Cell key={d.day} fill="var(--chart-4)" fillOpacity={peakDay && d.day === peakDay.day ? 1 : 0.45} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No payments yet" description="Revenue by weekday appears after the first checkout." />
          )}
        </Panel>
      </section>

      {/* Activity */}
      <section className="grid gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Recent orders" subtitle="Latest activity across the kitchen">
          {recentOrders.length ? (
            <ul className="divide-y divide-base-300">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {order.customer.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-base-content">{order.customer}</p>
                    <p className="truncate text-xs text-base-content/60">
                      {order.items} {order.items === 1 ? "item" : "items"} · {timeAgo(order.placedAt)}
                      {order.paymentStatus === "paid" ? " · Paid" : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                    <StatusBadge status={order.status} />
                    <span className="w-20 text-right text-sm font-bold tabular-nums text-base-content">{taka(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No orders yet" description="New orders will show up here in real time." />
          )}
        </Panel>

        <Panel title="Top riders" subtitle="Most completed deliveries">
          {topRiders.length ? (
            <RankList
              items={topRiders}
              labelKey="name"
              valueKey="deliveries"
              format={(v) => `${compact(v)} drops`}
              sub={(r) => `${taka(r.earnings)} earned`}
              color="var(--chart-6)"
            />
          ) : (
            <EmptyState title="No deliveries yet" description="Riders will rank here after completing deliveries." />
          )}
        </Panel>
      </section>
    </div>
  );
};

export default AdminDashboard;
