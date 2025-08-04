import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import Loading from "../../../Components/Loading/Loading";
import { Link } from "react-router";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Pagination } from "antd";

const MyOrders = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { width, height } = useWindowSize();

  const [page, setPage] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myOrders", page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders`, {
        params: {
          email: userEmail,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  useEffect(() => {
    const paidCount = orders.filter((o) => o.payment_status === "paid").length;

    if (paidCount >= 5) {
      setShowConfetti(true);
      setShowCongrats(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setShowCongrats(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orders]);

  const handleCancel = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be cancelled.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep it",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.patch(`/orders/${id}?email=${userEmail}`, {
          status: "cancelled",
        });
        Swal.fire("Cancelled", "Order has been cancelled.", "success");
        refetch();
      } catch (error) {
        Swal.fire(error.message, "Failed to cancel order.", "error");
      }
    }
  };

  return (
    <div className="p-4">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
        />
      )}
      {showCongrats && (
        <div className="fixed top-1/4 left-1/2 space-y-5 -translate-x-1/2 bg-white border border-primary shadow-lg rounded-xl px-6 py-4 z-50 text-center animate-bounce">
          <h2 className="text-3xl font-bold text-green-600">
            🎉 Congratulations! 🎉
          </h2>
          <p className="text-gray-700 lg">
            You’ve completed 5 or more paid orders!
          </p>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-6">
        My Orders
      </h2>

      {isLoading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-10">No orders yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-base-content/10 rounded-lg">
            <table className="table w-full text-center table-xs">
              <thead>
                <tr className="bg-base-200 text-sm">
                  <th>#</th>
                  <th>Order time</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>{new Date(o.placedAt).toLocaleString()}</td>
                    <td className="text-green-600 font-semibold">৳ {o.total.toLocaleString("en-BD")}</td>
                    <td className="capitalize">
                      {o.status === "pending" && (
                        <span className="text-purple-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "not_assigned" && (
                        <span className="text-blue-500 font-semibold">
                          not assigned to rider
                        </span>
                      )}
                      {o.status === "assigned" && (
                        <span className="text-yellow-600 font-semibold">
                          assigned to rider
                        </span>
                      )}
                      {o.status === "picked" && (
                        <span className="text-orange-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "delivered" && (
                        <span className="text-green-600 font-semibold">
                          {o.status}
                        </span>
                      )}
                      {o.status === "cancelled" && (
                        <span className="text-red-500 font-semibold">
                          {o.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {o.payment_status === "not_paid" ? (
                        o.status === "cancelled" ? (
                          " - "
                        ) : (
                          <span className="text-orange-500 font-medium">
                            Not Paid
                          </span>
                        )
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="flex items-center justify-center gap-1">
                      {o.status === "pending" ? (
                        <>
                          <Link to={`/dashboard/payment/${o._id}`}>
                            <button className="btn btn-xs btn-primary text-white">
                              Pay
                            </button>
                          </Link>

                          <button
                            className="btn btn-xs btn-error text-white"
                            onClick={() => handleCancel(o._id)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        "- -"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ant Design Pagination */}
          <div className="flex justify-center mt-10">
            <Pagination
              current={page}
              align="center"
              total={total}
              pageSize={10}
              showSizeChanger={false}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
