import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaMoneyBillWave } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import { BsTruck } from "react-icons/bs";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import { MdOutlinePendingActions } from "react-icons/md";

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

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <h2 className="text-center text-primary font-bold text-3xl sm:text-4xl mb-8">
            Rider Dashboard
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-10">
            {/* Total Earnings */}
            <div className="bg-green-100 text-green-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMoneyBillWave size={35} />
              <div>
                <p className="text-lg font-bold">
                  ৳ {stats.totalEarnings || 0}
                </p>
                <p className="text-sm font-medium">Total Earnings</p>
              </div>
            </div>

            {/* Cashout Money */}
            <div className="bg-purple-100 text-purple-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMoneyBillWave size={35} />
              <div>
                <p className="text-lg font-bold">৳ {stats.cashoutMoney || 0}</p>
                <p className="text-sm font-medium">Cashout Money</p>
              </div>
            </div>

            {/* Pending Cashout */}
            <div className="bg-teal-100 text-teal-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <FaMoneyBillWave size={35} />
              <div>
                <p className="text-lg font-bold">
                  ৳ {stats.pendingCashout || 0}
                </p>
                <p className="text-sm font-medium">Pending Cashout</p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-indigo-100 text-indigo-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <PiShoppingCartBold size={35} />
              <div>
                <p className="text-lg font-bold">{stats.totalOrders || 0}</p>
                <p className="text-sm font-medium">Total Orders</p>
              </div>
            </div>

            {/* Picked Orders */}
            <div className="bg-yellow-100 text-yellow-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <BsTruck size={35} />
              <div>
                <p className="text-lg font-bold">{stats.pickedOrders || 0}</p>
                <p className="text-sm font-medium">Picked Orders</p>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-orange-100 text-orange-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center gap-4">
              <MdOutlinePendingActions size={35} />
              <div>
                <p className="text-lg font-bold">{stats.pendingOrders || 0}</p>
                <p className="text-sm font-medium">Pending Orders</p>
              </div>
            </div>

            {/* Completed Orders */}
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
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
