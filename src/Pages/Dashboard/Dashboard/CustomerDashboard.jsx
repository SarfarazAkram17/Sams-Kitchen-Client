import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaMoneyBillWave } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { PiShoppingCartBold } from "react-icons/pi";
import { BsTruck } from "react-icons/bs";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import Loading from "../../../Components/Loading/Loading";
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

const CustomerDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["customerStats"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/stats/customer?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "customer",
    refetchInterval: 1000,
  });

  if (isLoading) return <Loading />;

  const {
    totalOrders,
    totalSpent,
    pendingOrders,
    processingOrders,
    dispatchedOrders,
    completedOrders,
    monthlyOrders = [],
    monthlyPayments = [],
  } = stats;

  return (
    <div className="px-4 space-y-8">
      <h2 className="text-center text-primary font-bold text-3xl sm:text-4xl mb-8">
        Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-pink-100 text-pink-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <PiShoppingCartBold size={35} />
          <div>
            <p className="text-lg font-bold">{totalOrders || 0}</p>
            <p className="text-sm font-medium">Total Orders</p>
          </div>
        </div>

        <div className="bg-green-100 text-green-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <FaMoneyBillWave size={35} />
          <div>
            <p className="text-lg font-bold">৳ {totalSpent || 0}</p>
            <p className="text-sm font-medium">Total Spent</p>
          </div>
        </div>

        <div className="bg-red-100 text-red-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <FaMoneyBillWave size={35} />
          <div>
            <p className="text-lg font-bold">{pendingOrders || 0}</p>
            <p className="text-sm font-medium">Not-Paid Orders</p>
          </div>
        </div>

        <div className="bg-orange-100 text-orange-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <FaArrowsRotate size={35} />
          <div>
            <p className="text-lg font-bold">{processingOrders || 0}</p>
            <p className="text-sm font-medium">Processing Orders</p>
          </div>
        </div>

        <div className="bg-blue-100 text-blue-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <BsTruck size={35} />
          <div>
            <p className="text-lg font-bold">{dispatchedOrders || 0}</p>
            <p className="text-sm font-medium">Dispatched Orders</p>
          </div>
        </div>

        <div className="bg-purple-100 text-purple-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
          <FaCheck size={35} />
          <div>
            <p className="text-lg font-bold">{completedOrders || 0}</p>
            <p className="text-sm font-medium">Completed Orders</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {monthlyOrders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="flex justify-center items-center font-lg font-semibold h-[200px]">
          No orders placed yet.
        </p>
      )}

      {monthlyPayments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h3 className="text-lg font-semibold mb-4">Monthly Payments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPayments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="payments"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="flex justify-center items-center font-lg font-semibold h-[200px]">
          No payments yet.
        </p>
      )}
    </div>
  );
};

export default CustomerDashboard;
