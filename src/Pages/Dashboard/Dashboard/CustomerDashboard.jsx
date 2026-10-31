import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
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
import { FiDollarSign, FiGift, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
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
  PageHeader,
  Panel,
  RankList,
  StatusBadge,
  axisProps,
  cursorStyle,
  greeting,
  hasValues,
  statusRows,
  taka,
  takaCompact,
  timeAgo,
  useGradientId,
} from "../../../Components/Charts/ChartKit";

const CustomerDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { user, userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();
  const spendGradient = useGradientId();

  const {
    data: stats = {},
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["customerStats", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get(`/stats/customer?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "customer",
    refetchInterval: 30000,
  });

  if (isLoading) return <Loading />;

  const monthly = stats.monthly || [];
  const weekday = stats.weekday || [];
  const statusData = statusRows(stats.statusCounts);
  const favourites = stats.favouriteFoods || [];
  const recent = stats.recentOrders || [];
  const busiestDay = weekday.reduce((best, d) => (d.orders > (best?.orders || 0) ? d : best), null);
  const firstName = (user?.displayName || userEmail?.split("@")[0] || "there").split(" ")[0];
  const activeOrders =
    (stats.processingOrders || 0) + (stats.assignedOrders || 0) + (stats.dispatchedOrders || 0);

  return (
    <div className="w-full space-y-5 pb-10">
      <PageHeader
        eyebrow="Your dashboard"
        title={`${greeting()}, ${firstName}`}
        subtitle={
          activeOrders > 0
            ? `You have ${activeOrders} ${activeOrders === 1 ? "order" : "orders"} being prepared or on the way.`
            : "Your ordering habits, spending and favourite dishes at a glance."
        }
        updatedAt={dataUpdatedAt}
      >
        <Link to="/dashboard/myOrders" className="btn btn-primary btn-sm min-h-10 rounded-full px-5">
          View my orders
        </Link>
      </PageHeader>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total spent"
          value={taka(stats.totalSpent)}
          icon={<FiDollarSign />}
          color="var(--chart-1)"
          hint={`across ${stats.paidOrders || 0} paid orders`}
          series={monthly}
          dataKey="spent"
        />
        <KpiCard
          label="Orders placed"
          value={stats.totalOrders || 0}
          icon={<FiShoppingBag />}
          color="var(--chart-2)"
          hint={`${stats.completedOrders || 0} delivered`}
          series={monthly}
          dataKey="orders"
        />
        <KpiCard
          label="Avg. order value"
          value={taka(stats.avgOrderValue)}
          icon={<FiTrendingUp />}
          color="var(--chart-3)"
          hint={stats.largestOrder ? `largest ${taka(stats.largestOrder)}` : "per paid order"}
          meter={{
            label: "Orders paid",
            value: stats.totalOrders ? Math.round(((stats.paidOrders || 0) / stats.totalOrders) * 100) : 0,
          }}
        />
        <KpiCard
          label="Saved with offers"
          value={taka(stats.totalSaved)}
          icon={<FiGift />}
          color="var(--chart-4)"
          hint="discounts applied to paid orders"
          meter={{
            label: "Savings vs. spend",
            value:
              stats.totalSpent + stats.totalSaved > 0
                ? Math.round((stats.totalSaved / (stats.totalSpent + stats.totalSaved)) * 100)
                : 0,
          }}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Spending & orders"
          subtitle="Paid amount and number of orders per month"
        >
          {hasValues(monthly, ["orders", "spent"]) ? (
            <>
              <Key
                items={[
                  { label: "Spent (৳)", color: "var(--chart-1)" },
                  { label: "Orders", color: "var(--chart-2)" },
                ]}
              />
              <div className="dash-chart mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthly} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                    <defs>
                      <GradientDef id={spendGradient} color="var(--chart-1)" from={0.4} />
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis yAxisId="amt" {...axisProps} tickFormatter={takaCompact} width={52} />
                    <YAxis yAxisId="ord" orientation="right" hide />
                    <Tooltip
                      cursor={cursorStyle}
                      content={<ChartTooltip title={(p) => p.month} format={{ spent: taka }} />}
                    />
                    <Bar
                      yAxisId="ord"
                      dataKey="orders"
                      name="Orders"
                      fill="var(--chart-2)"
                      fillOpacity={0.55}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Area
                      yAxisId="amt"
                      type="monotone"
                      dataKey="spent"
                      name="Spent"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      fill={`url(#${spendGradient})`}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-base-100)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="No orders yet" description="Your monthly spending will appear after your first order." />
          )}
        </Panel>

        <Panel title="Order status" subtitle="All of your orders">
          {statusData.length ? (
            <>
              <Donut data={statusData} centerValue={stats.totalOrders || 0} centerLabel="orders" />
              <LegendList data={statusData} />
            </>
          ) : (
            <EmptyState title="No orders yet" description="Place an order and track it here." />
          )}
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Your favourite dishes" subtitle="What you order most">
          {favourites.length ? (
            <RankList
              items={favourites}
              labelKey="name"
              valueKey="quantity"
              format={(v) => `${v}×`}
              sub={(f) => `${taka(f.revenue)} spent`}
              color="var(--chart-1)"
            />
          ) : (
            <EmptyState title="No favourites yet" description="Dishes you order often will be ranked here." />
          )}
        </Panel>

        <Panel
          title="Your ordering days"
          subtitle={busiestDay && busiestDay.orders > 0 ? `You order most on ${busiestDay.day}s` : "Orders by day of week"}
        >
          {hasValues(weekday, ["orders"]) ? (
            <div className="dash-chart h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekday} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 6" />
                  <XAxis dataKey="day" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} width={40} />
                  <Tooltip cursor={cursorStyle} content={<ChartTooltip />} />
                  <Bar dataKey="orders" name="Orders" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {weekday.map((d) => (
                      <Cell
                        key={d.day}
                        fill="var(--chart-3)"
                        fillOpacity={busiestDay && d.day === busiestDay.day ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No pattern yet" description="Your ordering days will show after a few orders." />
          )}
        </Panel>

        <Panel className="lg:col-span-2 xl:col-span-1" title="Recent orders" subtitle="Your latest five">
          {recent.length ? (
            <ul className="divide-y divide-base-300">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-base-content">
                      {order.firstItem}
                      {order.items > 1 ? ` +${order.items - 1} more` : ""}
                    </p>
                    <p className="text-xs text-base-content/60">{timeAgo(order.placedAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-bold tabular-nums text-base-content">{taka(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No orders yet" description="Your recent orders will be listed here." />
          )}
        </Panel>
      </section>
    </div>
  );
};

export default CustomerDashboard;
