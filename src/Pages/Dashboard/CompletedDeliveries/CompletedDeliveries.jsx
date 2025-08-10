import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import { useState } from "react";
import Loading from "../../../Components/Loading/Loading";
import { Pagination } from "antd";

const CompletedDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["completedDeliveries", userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get(`/riders/completedOrders`, {
        params: {
          email: userEmail,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  const [loadingOrderId, setLoadingOrderId] = useState(null);

  const { mutateAsync: cashout } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosSecure.patch(
        `/orders/${orderId}/cashout?email=${userEmail}`
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(["completedDeliveries"]).then(() => {
        Swal.fire("Success", "Cashout completed.", "success");
      });
      setLoadingOrderId(null);
    },
    onError: (error) => {
      Swal.fire(error.message, "Failed to cash out. Try again.", "error");
      setLoadingOrderId(null);
    },
  });

  const handleCashout = (orderId) => {
    Swal.fire({
      title: "Confirm Cashout",
      text: "You are about to cash out your earning of this delivery.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cash Out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoadingOrderId(orderId);
        cashout(orderId);
      }
    });
  };

  return (
    <div className="px-4">
      {isLoading ? (
        <Loading></Loading>
      ) : orders.length === 0 ? (
        <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
          No deliveries yet.
        </h1>
      ) : (
        <>
          <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
            Completed Deliveries
          </h1>
          <div className="overflow-x-auto rounded-box border-2 border-base-content/5 bg-base-200">
            <table className="table table-sm text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thana</th>
                  <th>Picked At</th>
                  <th>Delivered At</th>
                  <th>Total Cost</th>
                  <th>Your Earning</th>
                  <th>Cashout</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>{order.customer.address.thana}</td>
                    <td
                      className="truncate max-w-[80px]"
                      title={new Date(order.pickedAt).toLocaleString()}
                    >
                      {new Date(order.pickedAt).toLocaleString()}
                    </td>
                    <td
                      className="truncate max-w-[80px]"
                      title={new Date(order.deliveredAt).toLocaleString()}
                    >
                      {new Date(order.deliveredAt).toLocaleString()}
                    </td>
                    <td className="font-semibold text-sm text-green-600">
                      ৳{order.total}
                    </td>
                    <td className="font-semibold text-sm text-green-600">
                      ৳{order.deliveryCharge}
                    </td>
                    <td>
                      {order.cashout_status === "cashed_out" ? (
                        <span className="badge badge-success rounded-full h-auto badge-xs font-bold whitespace-nowrap">
                          Cashed Out
                        </span>
                      ) : (
                        <button
                          className="btn btn-xs btn-secondary text-white"
                          onClick={() => handleCashout(order._id)}
                          disabled={loadingOrderId === order._id}
                        >
                          {loadingOrderId === order._id ? (
                            <span className="loading loading-spinner loading-xs text-primary"></span>
                          ) : (
                            "Cashout"
                          )}
                        </button>
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

export default CompletedDeliveries;
