import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
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
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () =>
      setTheme(root.dataset.theme === "light" ? "light" : "dark");
    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    updateTheme();

    return () => observer.disconnect();
  }, []);

  const amount = orderInfo.total;
  const amountInCents = amount * 100;

  const formatCurrency = (amt) =>
    `৳${Number(amt).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handlePay = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (orderInfo.payment_status === "paid") {
      toast.info("Order is already paid");
      navigate("/dashboard/myOrders");
      return;
    }
    if (!stripe || !elements) {
      setError("The payment form is still loading. Please try again.");
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      setError("Enter your card details to continue.");
      return;
    }

    setLoading(true);
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
        color: theme === "dark" ? "#f1ecdf" : "#292a23",
        fontFamily: '"Inter", sans-serif',
        "::placeholder": {
          color: theme === "dark" ? "#a7aa9f" : "#777166",
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
        <label className="mb-2 block text-sm font-medium text-base-content">
          Card Details
        </label>
        <div className="rounded-xl border border-base-300 bg-base-200 p-4 text-base-content transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
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