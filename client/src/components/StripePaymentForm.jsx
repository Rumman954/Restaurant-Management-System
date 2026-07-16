import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { api } from "../lib/api";

export default function StripePaymentForm({ clientSecret, checkoutPayload, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed.");
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment was not completed.");
        return;
      }

      const token = sessionStorage.getItem("authToken");
      const res = await api.post(
        "/orders/checkout",
        {
          ...checkoutPayload,
          paymentMethod: "online",
          stripePaymentIntentId: paymentIntent.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess(res?.data?.order);
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Could not complete payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!clientSecret) {
    return <p className="text-sm text-rose-500">Could not start online payment.</p>;
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="brand-btn rounded-lg px-5 py-2 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
        >
          {submitting ? "Processing..." : "Pay & Place Order"}
        </button>
      </div>
    </form>
  );
}
