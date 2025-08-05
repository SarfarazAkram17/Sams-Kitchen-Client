import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle } from "react-icons/fa";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../../Hooks/useAuth";
import Loading from "../../../Components/Loading/Loading";
import { Pagination } from "antd";

const AssignRider = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["assignableOrders"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders`, {
        params: {
          email: userEmail,
          payment_status: "paid",
          status: "not_assigned",
          page,
          limit: 10,
        },
      });
      return res.data;
    },
    select: (data) => {
      // Sort orders by `placedAt` in ascending order for the Assign Rider page
      const sortedOrders = data.orders.sort(
        (a, b) => new Date(a.placedAt) - new Date(b.placedAt)
      );
      return { ...data, orders: sortedOrders };
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  const { mutateAsync: assignRider, isLoading: isAssigning } = useMutation({
    mutationFn: async ({ orderId, rider }) => {
      const res = await axiosSecure.patch(
        `/orders/${orderId}/assign?email=${userEmail}`,
        {
          riderId: rider._id,
          riderName: rider.name,
          riderEmail: rider.email,
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      setShowModal(false);

      Swal.fire("Success", "Rider assigned successfully!", "success").then(
        () => {
          setSelectedOrder(null);
        }
      );
      queryClient.invalidateQueries(["assignableOrders"]);
    },
    onError: (error) => {
      Swal.fire(error.message, "Failed to assign rider", "error");
    },
  });

  const openAssignModal = async (order) => {
    setSelectedOrder(order);
    setLoadingRiders(true);
    setRiders([]);
    setShowModal(true);

    try {
      const res = await axiosSecure.get(`/riders/available`, {
        params: {
          email: userEmail,
          thana: order.customer.address.thana,
        },
      });
      setRiders(res.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load riders", error.message);
    } finally {
      setLoadingRiders(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
        Assign Rider to Orders
      </h1>
      {isLoading ? (
        <Loading></Loading>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center">
          No orders available for assign.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-box border-2 border-base-content/5">
          <table className="table text-center table-xs w-full">
            <thead className="bg-base-200 text-sm">
              <tr>
                <th>#</th>
                <th>Order Time</th>
                <th>Region</th>
                <th>District</th>
                <th>Thana</th>
                <th>Total Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order._id}>
                  <td>{(page - 1) * 10 + i + 1}</td>
                  <td>{new Date(order.placedAt).toLocaleString()}</td>
                  <td>{order.customer.address.region}</td>
                  <td>{order.customer.address.district}</td>
                  <td>{order.customer.address.thana}</td>
                  <td>৳ {order.total}</td>
                  <td>
                    <button
                      onClick={() => openAssignModal(order)}
                      className="btn btn-xs btn-primary text-white"
                    >
                      <FaMotorcycle size={14} className="inline-block mr-1" />
                      Assign Rider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal with showModal state */}
          <div className={`modal ${showModal ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl">
              <h1 className="text-lg text-gray-600 font-extrabold mb-6 text-center">
                Assign Rider for Order
              </h1>

              {loadingRiders ? (
             
                  <Loading></Loading>
               
              ) : riders.length === 0 ? (
                <h1 className="text-lg text-error font-extrabold mb-6 text-center">
                  No available riders in this thana.
                </h1>
              ) : (
                <div className="overflow-auto max-h-80 rounded-box border-2 border-base-content/5 bg-base-200">
                  <table className="table text-center table-xs w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riders.map((rider) => (
                        <tr key={rider._id}>
                          <td>{rider.name}</td>
                          <td>{rider.email}</td>
                          <td>{rider.phone}</td>
                          <td>
                            <button
                              onClick={() =>
                                assignRider({
                                  orderId: selectedOrder._id,
                                  rider,
                                })
                              }
                              disabled={isAssigning}
                              className="btn btn-xs btn-primary whitespace-nowrap text-white"
                            >
                              {isAssigning ? (
                                <>
                                  <span className="loading loading-spinner loading-xs"></span>{" "}
                                  Assigning
                                </>
                              ) : (
                                "Assign"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-action">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                  }}
                  className="btn btn-sm btn-error"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default AssignRider;
