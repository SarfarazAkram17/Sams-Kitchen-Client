import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  FiCreditCard,
  FiPackage,
  FiMapPin,
  FiShield,
  FiLock,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
import { SiStripe } from "react-icons/si";
import { MdPayment } from "react-icons/md";
import PaymentForm from "./PaymentForm";
import SslPayment from "./SslPayment";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";

const stripePromise = loadStripe(import.meta.env.VITE_payment_key);

const Payment = () => {
  const [method, setMethod] = useState("stripe");
  const { orderId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();

  const { data: orderInfo, isPending } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/orders/${orderId}?email=${userEmail}`
      );
      return res.data;
    },
  });

  const formatCurrency = (amt) =>
    `৳${Number(amt).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <FiCreditCard className="text-3xl text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete Your Payment
        </h1>
        <p className="text-gray-600 mt-2">
          Secure checkout for your delicious order
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - Order Summary */}
        <div className="space-y-4">
          {/* Order Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiPackage className="text-primary" />
                  <h2 className="font-semibold text-gray-900">Order Summary</h2>
                </div>
                <span className="text-xs font-mono bg-white px-2 py-1 rounded text-gray-600">
                  {orderId.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <LuChefHat className="text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {orderInfo.items.reduce((t, i) => t + i.quantity, 0)}{" "}
                  {orderInfo.items.reduce((t, i) => t + i.quantity, 0) === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {orderInfo.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 bg-base-200 rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        title={item.name}
                        className="font-medium text-gray-900 text-sm truncate mb-1"
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}{" "}
                        {item.discount > 0 && (
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ml-2 text-[10px]">
                            {item.discount}% OFF
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-dashed space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className=" font-semibold">
                    {formatCurrency(orderInfo.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span
                    className={
                      Number(orderInfo.deliveryCharge) === 0
                        ? "text-green-600 font-semibold"
                        : "font-semibold"
                    }
                  >
                    {Number(orderInfo.deliveryCharge) === 0
                      ? "Free"
                      : formatCurrency(orderInfo.deliveryCharge)}
                  </span>
                </div>
                {Number(orderInfo.discount) > 0 && (
                  <div className="flex justify-between text-warning font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(orderInfo.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                  <span>Total</span>
                  <span className="text-primary font-semibold">
                    {formatCurrency(orderInfo.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiMapPin className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Delivery Address
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                  {orderInfo.customer.firstName} {orderInfo.customer.lastName}
                </p>
                <p className="text-xs text-gray-600">
                  {orderInfo.customer.phone}
                </p>
                <p className="text-xs text-gray-600">
                  {[
                    orderInfo.customer.address?.street,
                    orderInfo.customer.address?.thana,
                    orderInfo.customer.address?.district,
                    orderInfo.customer.address?.region,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Methods */}
        <div className="space-y-4">
          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-emerald-50 p-4 border-b">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-green-600" />
                <h2 className="font-semibold text-gray-900">Payment Method</h2>
              </div>
            </div>

            <div className="p-4">
              {/* Method Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setMethod("stripe")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === "stripe"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <SiStripe
                    className={`text-2xl mx-auto mb-2 ${
                      method === "stripe" ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      method === "stripe" ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    Stripe
                  </p>
                  <p className="text-xs text-gray-500">Card Payment</p>
                </button>

                <button
                  onClick={() => setMethod("sslcommerz")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    method === "sslcommerz"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <MdPayment
                    className={`text-2xl mx-auto mb-2 ${
                      method === "sslcommerz" ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      method === "sslcommerz" ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    SSL Commerz
                  </p>
                  <p className="text-xs text-gray-500">
                    Support All Online Payments
                  </p>
                </button>
              </div>

              {/* Payment Form */}
              <div className="mt-4">
                {method === "stripe" && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm orderInfo={orderInfo} />
                  </Elements>
                )}
                {method === "sslcommerz" && (
                  <SslPayment orderInfo={orderInfo} />
                )}
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FiShield className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure
                </p>
              </div>
              <FiLock className="text-green-600 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;