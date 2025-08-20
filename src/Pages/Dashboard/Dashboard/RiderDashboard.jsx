import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaMoneyBillWave } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import { BsTruck } from "react-icons/bs";
import { MdOutlinePendingActions } from "react-icons/md";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const RiderDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["riderStats"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/stats/rider?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "rider",
    refetchInterval: 1000,
  });

  if (isLoading) return <Loading />;

  const {
    totalOrders,
    totalEarnings,
    pickedOrders,
    pendingOrders,
    completedOrders,
    cashoutMoney,
    pendingCashout,
    monthlyEarnings = [],
  } = stats;

  return (
    <div className="px-4 space-y-8">
      <h2 className="text-center text-primary font-bold text-3xl sm:text-4xl mb-8">
        Rider Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-green-100 text-green-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <FaMoneyBillWave size={35} />
          <div>
            <p className="text-lg font-bold">৳ {totalEarnings || 0}</p>
            <p className="text-sm font-medium">Total Earnings</p>
          </div>
        </div>

        <div className="bg-purple-100 text-purple-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <FaMoneyBillWave size={35} />
          <div>
            <p className="text-lg font-bold">৳ {cashoutMoney || 0}</p>
            <p className="text-sm font-medium">Cashout Money</p>
          </div>
        </div>

        <div className="bg-teal-100 text-teal-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <FaMoneyBillWave size={35} />
          <div>
            <p className="text-lg font-bold">৳ {pendingCashout || 0}</p>
            <p className="text-sm font-medium">Pending Cashout</p>
          </div>
        </div>

        <div className="bg-indigo-100 text-indigo-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <PiShoppingCartBold size={35} />
          <div>
            <p className="text-lg font-bold">{totalOrders || 0}</p>
            <p className="text-sm font-medium">Total Orders</p>
          </div>
        </div>

        <div className="bg-orange-100 text-orange-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <MdOutlinePendingActions size={35} />
          <div>
            <p className="text-lg font-bold">{pendingOrders || 0}</p>
            <p className="text-sm font-medium">Pending Orders</p>
          </div>
        </div>

        <div className="bg-yellow-100 text-yellow-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <BsTruck size={35} />
          <div>
            <p className="text-lg font-bold">{pickedOrders || 0}</p>
            <p className="text-sm font-medium">Picked Orders</p>
          </div>
        </div>

        <div className="bg-rose-100 text-rose-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <FaCheck size={35} />
          <div>
            <p className="text-lg font-bold">{completedOrders || 0}</p>
            <p className="text-sm font-medium">Completed Orders</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {/* Monthly Earnings Line Chart */}
      {monthlyEarnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyEarnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="earnings" />
              <Tooltip formatter={(value) => `৳ ${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Orders Bar Chart */}
      {monthlyEarnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyEarnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="orders" />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
