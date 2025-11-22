import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { FiArrowRight } from "react-icons/fi";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";

const SslPayment = ({ orderInfo }) => {
  const axiosSecure = useAxiosSecure();
  const { orderId } = useParams();
  const { user, userEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amt) =>
    `৳${Number(amt).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (orderInfo.payment_status === "paid") {
      toast.info("Order is already paid");
      navigate("/dashboard/myOrders");
      return;
    }

    try {
      const paymentData = {
        orderId,
        name: user.displayName,
        email: userEmail,
        amount: parseFloat(orderInfo.total),
        transactionId: "",
        paymentMethod: "SSL Commerz",
        status: "pending",
      };

      const res = await axiosSecure.post(
        `/payments/create-ssl-payment?email=${userEmail}`,
        paymentData
      );

      if (res?.data?.gatewayUrl) {
        window.location.replace(res.data.gatewayUrl);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {/* Info Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Note:</span> You will be redirected to
          SSL Commerz secure payment gateway to complete your payment.
        </p>
      </div>

      {/* Supported Methods */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Supported payment methods:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "bKash",
            "Nagad",
            "Rocket",
            "Visa",
            "Mastercard",
            "DBBL",
            "City Bank",
            "etc.",
          ].map((method) => (
            <span
              key={method}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        className="btn btn-primary text-white w-full disabled:text-black/60"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            Redirecting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Pay {formatCurrency(orderInfo.total)}
            <FiArrowRight />
          </span>
        )}
      </button>
    </form>
  );
};

export default SslPayment;