import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { toast } from "react-toastify";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const { orderId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: orderInfo, isPending } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/orders/${orderId}?email=${userEmail}`
      );
      return res.data;
    },
  });

  if (isPending) {
    return <Loading></Loading>;
  }

  const amount = orderInfo.total;
  const amountInCents = amount * 100;

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
        {
          amountInCents,
        }
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
              confirmButtonText: "Go to My Orders",
            });
            setLoading(false);

            navigate("/dashboard/myOrders");
          }
        }
      }
    }
  };

  return (
    <div>
      <form
        onSubmit={handlePay}
        className="rounded-xl space-y-4 bg-white p-6 mt-4 shadow-xl w-full max-w-md border border-sky-300"
      >
        <h3 className="text-lg font-bold text-center text-green-600">
          Total Cost: ৳{orderInfo.total}
        </h3>
        <CardElement className="p-2 border rounded"></CardElement>
        <button
          type="submit"
          className="btn btn-primary text-white disabled:text-black/50 w-full mt-3"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner text-primary loading-md"></span>{" "}
              Paying
            </>
          ) : (
            `Pay ৳${amount}`
          )}
        </button>
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;