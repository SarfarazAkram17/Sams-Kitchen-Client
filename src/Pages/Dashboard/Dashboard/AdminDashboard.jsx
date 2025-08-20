import { useQuery } from "@tanstack/react-query";
import {
  FaUserAlt,
  FaMotorcycle,
  FaCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import Loading from "../../../Components/Loading/Loading";
import { BsTruck } from "react-icons/bs";
import { FaArrowsRotate } from "react-icons/fa6";
import { IoFastFoodOutline } from "react-icons/io5";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/stats/admin?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "admin",
    refetchInterval: 1000,
  });

  // ---- Charts Data ----
  const orderStatusData = [
    stats.processingOrders > 0 && {
      name: "Processing",
      value: stats.processingOrders,
    },
    stats.assignedOrders > 0 && {
      name: "Assigned",
      value: stats.assignedOrders,
    },
    stats.dispatchedOrders > 0 && {
      name: "Dispatched",
      value: stats.dispatchedOrders,
    },
    stats.completedOrders > 0 && {
      name: "Completed",
      value: stats.completedOrders,
    },
  ].filter(Boolean);

  // Use real monthlyOrdersData from API
  const monthlyOrdersData = stats.monthlyOrdersData || [];
  const monthlyPaymentsData = stats.monthlyPaymentsData || [];
  const topFoodsData = stats.topFoodsData || [];

  return (
    <div className="px-4">
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <h2 className="text-center text-primary font-bold text-3xl sm:text-4xl mb-8">
            Admin Dashboard
          </h2>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4">
            <div className="bg-pink-100 text-pink-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaUserAlt size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalUsers || 0}</p>
                <p className="text-sm font-medium">Total Users</p>
              </div>
            </div>

            <div className="bg-blue-100 text-blue-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMotorcycle size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalRiders || 0}</p>
                <p className="text-sm font-medium">Total Riders</p>
              </div>
            </div>

            <div className="bg-indigo-100 text-indigo-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <IoFastFoodOutline size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalFoods || 0}</p>
                <p className="text-sm font-medium">Total Foods</p>
              </div>
            </div>

            <div className="bg-orange-100 text-orange-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <PiShoppingCartBold size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalOrders || 0}</p>
                <p className="text-sm font-medium">Total Orders</p>
              </div>
            </div>

            <div className="bg-green-100 text-green-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMoneyBillWave size={35} />
              <div>
                <p className="text-lg font-bold">
                  ৳ {stats.totalPayments || 0}
                </p>
                <p className="text-sm font-medium">Total Payments</p>
              </div>
            </div>

            <div className="bg-purple-100 text-purple-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaArrowsRotate size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.processingOrders || 0}
                </p>
                <p className="text-sm font-medium">Processing Orders</p>
              </div>
            </div>

            <div className="bg-gray-100 text-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMotorcycle size={35} />
              <div>
                <p className="text-lg font-bold">{stats.assignedOrders || 0}</p>
                <p className="text-sm font-medium">Assigned Orders</p>
              </div>
            </div>

            <div className="bg-yellow-100 text-yellow-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <BsTruck size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.dispatchedOrders || 0}
                </p>
                <p className="text-sm font-medium">Dispatched Orders</p>
              </div>
            </div>

            <div className="bg-rose-100 text-rose-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaCheck size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.completedOrders || 0}
                </p>
                <p className="text-sm font-medium">Completed Orders</p>
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          {orderStatusData.length > 0 && (
            <div className="bg-white shadow-xl mt-6 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Orders by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Orders */}
          {monthlyOrdersData.length > 0 && (
            <div className="bg-white shadow-xl mt-6 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">
                Monthly Orders Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#36A2EB"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Payments */}
          {monthlyPaymentsData.length > 0 && (
            <div className="bg-white shadow-xl mt-6 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Payments per Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPaymentsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="payments" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Foods */}
          {topFoodsData.length > 0 && (
            <div className="bg-white shadow-xl mt-6 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Top Foods Ordered</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topFoodsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;