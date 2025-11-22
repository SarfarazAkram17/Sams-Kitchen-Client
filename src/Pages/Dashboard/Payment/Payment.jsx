import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import SslPayment from "./SslPayment";

const stripePromise = loadStripe(import.meta.env.VITE_payment_key);

const Payment = () => {
  const [method, setMethod] = useState("stripe");

  return (
    <div className="px-4">
      <p className="text-center text-sm font-semibold text-warning">
        --- Please pay to eat ---
      </p>
      <h2 className="text-3xl sm:text-4xl py-2 font-semibold border-y-3 max-w-xs mx-auto border-gray-200 mb-10 text-center mt-4">
        PAYMENT
      </h2>

      {/* Select Input */}

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Payment method</legend>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="select border border-gray-300"
        >
          <option value="stripe">💳 Stripe (Card Payment)</option>
          <option value="sslcommerz">SSL Commerz</option>
        </select>
      </fieldset>

      {/* Render Payment Component */}
      <div className="mt-6">
        {method === "stripe" && (
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        )}
        {method === "sslcommerz" && <SslPayment />}
      </div>
    </div>
  );
};

export default Payment;