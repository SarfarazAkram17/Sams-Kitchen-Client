import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiLock } from "react-icons/fi";

const PaymentForm = ({ orderInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const { orderId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const amount = orderInfo.total;
  const amountInCents = amount * 100;

  const formatCurrency = (amt) =>
    `৳${Number(amt).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handlePay = async (e) => {
    e.preventDefault();

    if (orderInfo.payment_status === "paid") {
      toast.info("Order is already paid");
      navigate("/dashboard/myOrders");
      return;
    }
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      setLoading(false);
      return;
    }

    const { error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError("");
      setLoading(true);

      const res = await axiosSecure.post(
        `/payments/create-payment-intent?email=${userEmail}`,
        { amountInCents }
      );
      const clientSecret = res.data.clientSecret;
      const name = `${orderInfo.customer.firstName} ${orderInfo.customer.lastName}`;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name,
            email: orderInfo.customer.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        setError("");
        setLoading(true);
        if (result.paymentIntent.status === "succeeded") {
          const transactionId = result.paymentIntent.id;
          const paymentData = {
            orderId,
            email: userEmail,
            amount,
            transactionId,
            paymentMethod: result.paymentIntent.payment_method_types,
          };

          const paymentRes = await axiosSecure.post(
            `/payments?email=${userEmail}`,
            paymentData
          );
          if (paymentRes.data.insertedId) {
            await Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              text: "Your order is being prepared",
              confirmButtonText: "Go to My Orders",
              confirmButtonColor: "#22c55e",
            });
            setLoading(false);
            navigate("/dashboard/myOrders");
          }
        }
      }
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#374151",
        fontFamily: '"Inter", sans-serif',
        "::placeholder": {
          color: "#9ca3af",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
    },
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-xl bg-gray-50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        className="btn btn-primary text-white w-full disabled:text-black/60"
        disabled={!stripe || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FiLock className="text-lg" />
            Pay {formatCurrency(amount)}
          </span>
        )}
      </button>

      {/* Test Card Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 font-medium mb-1">Test Card</p>
        <p className="text-xs text-blue-600 font-mono">4242 4242 4242 4242</p>
        <p className="text-xs text-blue-600">Any future date • Any CVC</p>
      </div>
    </form>
  );
};

export default PaymentForm;