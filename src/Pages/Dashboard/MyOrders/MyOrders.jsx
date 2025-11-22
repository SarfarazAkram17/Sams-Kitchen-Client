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
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiCreditCard,
  FiFileText,
  FiUserCheck,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
import { MdDeliveryDining } from "react-icons/md";
import { generateReceipt } from "../../../lib/generateReceipt";
import { FaMotorcycle } from "react-icons/fa";

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
      const res = await axiosSecure.get("/orders", {
        params: { email: userEmail, page, limit: 10 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  useEffect(() => {
    const paidCount = orders.filter((o) => o.payment_status === "paid").length;
    if (paidCount === 5 || paidCount === 10 || paidCount === 15) {
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
        Swal.fire("Failed to cancel order.", error.message, "error");
      }
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock size={15} className="text-orange-500" />,
      cancelled: <FiXCircle size={15} className="text-red-500" />,
      not_assigned: <FiPackage size={15} className="text-purple-500" />,
      assigned: <FiUserCheck size={15} className="text-yellow-600" />,
      picked: <FaMotorcycle size={15} className="text-blue-500" />,
      delivered: <FiCheckCircle size={15} className="text-green-500" />,
    };
    return icons[status] || <FiPackage className="text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 border-orange-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      not_assigned: "bg-purple-100 text-purple-800 border-purple-200",
      assigned: "bg-yellow-100 text-yellow-800 border-yellow-200",
      picked: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending Payment",
      cancelled: "Cancelled",
      not_assigned: "Preparing",
      assigned: "Rider Assigned",
      picked: "On the Way",
      delivered: "Delivered",
    };
    return labels[status] || status;
  };

  const getPaymentColor = (status) => {
    return status === "paid"
      ? "bg-green-100 text-green-700"
      : "bg-orange-100 text-orange-700";
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

  // Status order for stats display
  const statusStats = [
    { label: "All", key: "all" },
    { label: "Pending", key: "pending" },
    { label: "Preparing", key: "not_assigned" },
    { label: "Assigned", key: "assigned" },
    { label: "On The Way", key: "picked" },
    { label: "Delivered", key: "delivered" },
    { label: "Cancelled", key: "cancelled" },
  ];

  return (
    <div className="px-4 pb-10">
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
            You've completed{" "}
            {orders.filter((o) => o.payment_status === "paid").length} paid
            orders!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
          My Orders
        </h1>
        <p className="text-gray-600">Track and manage your food orders</p>
      </div>

      {isLoading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FiPackage className="mx-auto text-gray-300 mb-4 text-6xl" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500">Start ordering delicious food!</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2.5">
              {statusStats.map(({ label, key }) => (
                <div
                  key={key}
                  className="text-center p-2 rounded-lg bg-base-200 min-w-[70px]"
                >
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {key === "all"
                      ? orders.length
                      : orders.filter((o) => o.status === key).length}
                  </p>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b bg-base-200">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                      {order.status !== "cancelled" && (
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status === "paid" ? "PAID" : "UNPAID"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <LuChefHat className="text-primary text-lg" />
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                    <span className="text-xs text-gray-500">
                      (
                      {order.items.reduce((totalQuantity, item) => {
                        return item.quantity + totalQuantity;
                      }, 0)}{" "}
                      {order.items.reduce((totalQuantity, item) => {
                        return item.quantity + totalQuantity;
                      }, 0) === 1
                        ? "item"
                        : "items"}
                      )
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 title={item.name} className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1 flex-wrap">
                            <span>
                              {formatCurrency(item.price)} × {item.quantity}
                            </span>
                            {item.discount > 0 && (
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">
                                {item.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 flex-shrink-0 text-sm">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-3 border-t border-dashed space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span
                        className={
                          Number(order.deliveryCharge) === 0
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        {Number(order.deliveryCharge) === 0
                          ? "Free"
                          : formatCurrency(order.deliveryCharge)}
                      </span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-orange-600">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-green-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Delivery Address */}
                    <div className="bg-blue-50 p-3 rounded-lg">
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
                          <p className="text-xs text-gray-600">
                            {[
                              order.customer.address?.street,
                              order.customer.address?.thana,
                              order.customer.address?.district,
                              order.customer.address?.region,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rider/Payment Info */}
                    <div
                      className={`p-3 rounded-lg ${
                        order.assigned_rider_name
                          ? "bg-amber-50"
                          : "bg-green-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {order.assigned_rider_name ? (
                          <>
                            <FaMotorcycle className="text-amber-600 mt-0.5 flex-shrink-0 text-lg" />
                            <div>
                              <p className="text-xs font-semibold text-amber-900 mb-1">
                                Delivery Rider
                              </p>
                              <p className="text-sm text-gray-700 font-medium">
                                {order.assigned_rider_name}
                              </p>
                              {order.assignedAt && (
                                <p className="text-xs text-gray-600">
                                  Assigned: {formatDate(order.assignedAt)}
                                </p>
                              )}
                              {order.pickedAt && (
                                <p className="text-xs text-gray-600">
                                  Picked: {formatDate(order.pickedAt)}
                                </p>
                              )}
                              {order.deliveredAt && (
                                <p className="text-xs text-green-600 font-medium">
                                  Delivered: {formatDate(order.deliveredAt)}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <FiCreditCard className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-green-900 mb-1">
                                Payment Info
                              </p>
                              <p className="text-sm text-gray-700 font-medium">
                                {order.payment_status === "paid"
                                  ? "Payment Completed"
                                  : "Payment Pending"}
                              </p>
                              {order.paidAt && (
                                <p className="text-xs text-gray-600">
                                  Paid: {formatDate(order.paidAt)}
                                </p>
                              )}
                              {order.status === "not_assigned" && (
                                <p className="text-xs text-purple-600 mt-1">
                                  Your order is being prepared
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status === "pending" && (
                      <>
                        <Link to={`/dashboard/payment/${order._id}`}>
                          <button className="btn btn-sm btn-primary text-white">
                            Pay Now
                          </button>
                        </Link>
                        <button
                          className="btn btn-sm btn-error text-white"
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {order.status === "cancelled" && (
                      <span className="text-sm text-red-500 font-medium">
                        This order was cancelled
                      </span>
                    )}
                    {order.status !== "cancelled" &&
                      order.status !== "pending" && (
                        <button
                          onClick={() => generateReceipt(order)}
                          className="btn btn-sm btn-info text-white"
                        >
                          <FiFileText className="mr-1" />
                          Download Receipt
                        </button>
                      )}
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
    </div>
  );
};

export default MyOrders;