import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle } from "react-icons/fa";
import {
  FiPackage,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
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
    queryKey: ["assignableOrders", page],
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amt) =>
    `৳${Number(amt).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FaMotorcycle className="text-2xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Assign Rider
            </h1>
            <p className="text-gray-600">
              Assign delivery riders to paid orders
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiPackage className="text-xl text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-600">
                Orders awaiting rider assignment
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FiCheckCircle className="mx-auto text-green-400 mb-4 text-6xl" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500">No orders awaiting rider assignment</p>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b bg-gradient-to-r from-base-200 to-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-900">
                          {order._id.toUpperCase()}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-gray-300" />
                      <div>
                        <p className="text-xs text-gray-500">Order Time</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(order.placedAt)}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-gray-300" />
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                        <FiPackage size={15} />
                        Awaiting Rider
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        PAID
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Items */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <LuChefHat className="text-primary" />
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Order Items
                        </h3>
                        <span className="text-xs text-gray-500">
                          ({order.items.reduce((t, i) => t + i.quantity, 0)}{" "}
                          items)
                        </span>
                      </div>
                      <div className="space-y-2 max-h-35 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-base-200 rounded-lg"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p title={item.name} className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-blue-50 p-3 rounded-lg h-fit">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">
                            Delivery Address
                          </p>
                          <p className="text-sm text-gray-700 font-medium">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.customer.phone}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Region:</span>{" "}
                              {order.customer.address.region}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">District:</span>{" "}
                              {order.customer.address.district}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span>Thana:</span> {order.customer.address.thana}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span>Street:</span>{" "}
                              {order.customer.address.street}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <button
                      onClick={() => openAssignModal(order)}
                      className="btn btn-primary text-white btn-sm"
                    >
                      <FaMotorcycle size={17} className="mr-1.5" />
                      Assign Rider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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

      {/* Assign Rider Modal */}
      <div className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box max-w-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FaMotorcycle className="text-xl text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Select Rider
                </h3>
                {selectedOrder && (
                  <p className="text-xs text-gray-500">
                    For delivery to {selectedOrder.customer.address.thana}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedOrder(null);
              }}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Selected Order Summary */}
          {selectedOrder && (
            <div className="bg-base-200 rounded-xl p-3 mb-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Customer: </span>
                  <span className="font-medium">
                    {selectedOrder.customer.firstName}{" "}
                    {selectedOrder.customer.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total: </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Items: </span>
                  <span className="font-medium">
                    {selectedOrder.items.reduce((t, i) => t + i.quantity, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Riders List */}
          {loadingRiders ? (
            <div className="py-10">
              <Loading />
            </div>
          ) : riders.length === 0 ? (
            <div className="text-center py-10">
              <FaMotorcycle className="mx-auto text-5xl text-gray-400 mb-3" />
              <h4 className="text-lg font-semibold text-red-500 mb-1">
                No Riders Available
              </h4>
              <p className="text-sm text-gray-500">
                No available riders found in{" "}
                {selectedOrder?.customer.address.thana}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {riders.map((rider) => (
                <div
                  key={rider._id}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FiUser className="text-xl text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {rider.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiMail className="text-gray-600" />
                          {rider.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiPhone className="text-gray-600" />
                          {rider.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      assignRider({ orderId: selectedOrder._id, rider })
                    }
                    disabled={isAssigning}
                    className="btn btn-sm btn-primary text-white"
                  >
                    {isAssigning ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Assigning
                      </>
                    ) : (
                      <>
                        <FaMotorcycle size={16} />
                        Assign
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modal Footer */}
          <div className="modal-action">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedOrder(null);
              }}
              className="btn btn-error text-white"
            >
              Cancel
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop bg-black/50"
          onClick={() => setShowModal(false)}
        ></div>
      </div>
    </div>
  );
};

export default AssignRider;