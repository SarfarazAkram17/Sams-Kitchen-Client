import { useQuery } from "@tanstack/react-query";
import Loading from "../../../Components/Loading/Loading";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

const SslPayment = () => {
  const axiosSecure = useAxiosSecure();
  const { orderId } = useParams();
  const { user, userEmail } = useAuth();
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

  const handlePay = async (e) => {
    e.preventDefault();

    if (orderInfo.payment_status === "paid") {
      toast.info("Order is already paid");
      navigate("/dashboard/myOrders");
      return;
    }

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
      `/create-ssl-payment?email=${userEmail}`,
      paymentData
    );

    if (res?.data?.gatewayUrl) {
      return window.location.replace(res.data.gatewayUrl);
    }
  };
  return (
    <div className="mt-4 not-even:max-w-md w-full border border-sky-300 shadow-xl bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold text-center text-green-600">
        Total Cost: ৳{orderInfo.total}
      </h3>
      <form onSubmit={handlePay}>
        <label className="label font-semibold mt-4 text-sm">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={userEmail}
          readOnly
          className="input mt-2 text-sm w-full border border-gray-300"
          placeholder="Enter your email"
        />
        <button
          type="submit"
          className="btn btn-primary text-white w-full mt-5"
        >
          Pay ৳{orderInfo.total}
        </button>
      </form>
    </div>
  );
};

export default SslPayment;
