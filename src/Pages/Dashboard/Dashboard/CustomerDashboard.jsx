import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaMoneyBillWave } from "react-icons/fa";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import Loading from "../../../Components/Loading/Loading";
import { FaArrowsRotate } from "react-icons/fa6";
import { PiShoppingCartBold } from "react-icons/pi";
import { BsTruck } from "react-icons/bs";

const CustomerDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const { roleLoading, role } = useUserRole();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["customerStats"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/customer/stats?email=${userEmail}`);
      return res.data;
    },
    enabled: !roleLoading && role === "customer",
    refetchInterval: 1000,
  });

  return (
    <div>
      {isLoading ? (
        <Loading></Loading>
      ) : (
        <div>
          <h2 className="text-center text-primary font-bold text-3xl sm:text-4xl mb-8">
            Dashboard
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-10">
            <div className="bg-pink-100 text-pink-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <PiShoppingCartBold size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalOrders || 0}</p>
                <p className="text-sm font-medium">Total Orders</p>
              </div>
            </div>

            <div className="bg-green-100 text-green-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMoneyBillWave size={35} />
              <div>
                <p className="text-lg font-bold">৳ {stats.totalSpent || 0}</p>
                <p className="text-sm font-medium">Total Spent</p>
              </div>
            </div>

            <div className="bg-orange-100 text-orange-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaArrowsRotate size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.processingOrders || 0}
                </p>
                <p className="text-sm font-medium">Processing Orders</p>
              </div>
            </div>

            <div className="bg-blue-100 text-blue-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <BsTruck size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.dispatchedOrders || 0}
                </p>
                <p className="text-sm font-medium">Dispatched Orders</p>
              </div>
            </div>

            <div className="bg-purple-100 text-purple-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaCheck size={35} />
              <div>
                <p className="text-lg font-bold">
                  {stats.completedOrders || 0}
                </p>
                <p className="text-sm font-medium">Completed Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
