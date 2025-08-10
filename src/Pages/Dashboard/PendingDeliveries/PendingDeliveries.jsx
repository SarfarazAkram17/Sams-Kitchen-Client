import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import { Pagination } from "antd";

const PendingDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [page, setPage] = useState(1);

  const [activeOrderId, setActiveOrderId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["riderOrders", userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get(`/riders/orders`, {
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

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: async ({ order, status }) => {
      const res = await axiosSecure.patch(
        `/orders/${order._id}/status?email=${userEmail}`,
        {
          status,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["riderOrders"]);
    },
  });

  const handleStatusUpdate = (order, newStatus) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Mark order as ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    }).then((result) => {
      if (result.isConfirmed) {
        setActiveOrderId(order._id);
        updateStatus({ order, status: newStatus })
          .then(async () => {
            Swal.fire("Updated!", "Parcel status updated.", "success");
          })
          .catch((error) => {
            Swal.fire(error.message, "Failed to update status.", "error");
          })
          .finally(() => {
            setActiveOrderId(null);
          });
      }
    });
  };

  return (
    <div className="px-4">
      {isLoading ? (
        <Loading></Loading>
      ) : orders.length === 0 ? (
        <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
          No assigned orders yet.
        </h1>
      ) : (
        <>
          <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
            Pending Deliveries
          </h1>
          <div className="overflow-x-auto rounded-box border-2 border-base-content/5">
            <table className="table table-sm text-center">
              <thead>
                <tr className="bg-base-200">
                  <th>#</th>
                  <th>Receiver</th>
                  <th>Receiver Thana</th>
                  <th>Total Cost</th>
                  <th>Your Earning</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id}>
                    <td>{(page - 1) * 10 + i + 1}</td>
                    <td>{`${order.customer.firstName} ${order.customer.lastName}`}</td>
                    <td>{order.customer.address.thana}</td>
                    <td className="text-green-600 font-semibold">
                      ৳{order.total}
                    </td>
                    <td className="text-secondary font-semibold">
                      ৳
                      {order.deliveryCharge
                        ? order.deliveryCharge
                        : order.items.length > 1
                        ? 50
                        : 30}
                    </td>
                    <td className="capitalize">
                      {order.status === "assigned" && (
                        <span className="text-yellow-600 font-semibold">
                          {order.status}
                        </span>
                      )}
                      {order.status === "picked" && (
                        <span className="text-orange-500 font-semibold">
                          {order.status}
                        </span>
                      )}
                      {order.status === "delivered" && (
                        <span className="text-green-600 font-semibold">
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {order.status === "assigned" && (
                        <button
                          className="btn btn-xs btn-secondary whitespace-nowrap text-white"
                          disabled={activeOrderId === order._id}
                          onClick={() => handleStatusUpdate(order, "picked")}
                        >
                          {activeOrderId === order._id ? (
                            <span className="loading loading-spinner loading-xs text-primary"></span>
                          ) : (
                            "Mark Picked"
                          )}
                        </button>
                      )}
                      {order.status === "picked" && (
                        <button
                          disabled={activeOrderId === order._id}
                          className="btn btn-xs btn-primary whitespace-nowrap text-white"
                          onClick={() => handleStatusUpdate(order, "delivered")}
                        >
                          {activeOrderId === order._id ? (
                            <span className="loading loading-spinner loading-xs text-primary"></span>
                          ) : (
                            "Mark Delivered"
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

export default PendingDeliveries;
