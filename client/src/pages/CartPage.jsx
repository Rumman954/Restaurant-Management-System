import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { formatAmount } from "../lib/formatPrice";
import { calcOrderTotals, itemUnitPrice } from "../lib/orderTotals";
import StripePaymentForm from "../components/StripePaymentForm";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const PICKUP_ADDRESS = "123, Kuratoli, Kuril, Dhaka — Restaurant Pickup Point";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [placing, setPlacing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentView, setPaymentView] = useState("choose");
  const [clientSecret, setClientSecret] = useState("");

  const totals = useMemo(() => calcOrderTotals(items, deliveryType), [items, deliveryType]);

  const checkoutPayload = useMemo(
    () => ({
      items,
      deliveryType,
      address: deliveryType === "delivery" ? address.trim() : "",
      agreedToTerms: agreed,
    }),
    [items, deliveryType, address, agreed]
  );

  const requireLogin = () => {
    setStatus({ type: "error", message: "Please login to place your order." });
    window.dispatchEvent(new Event("open-login-modal"));
    return false;
  };

  const validateBeforePlace = () => {
    if (!items.length) {
      setStatus({ type: "error", message: "Your cart is empty." });
      return false;
    }
    if (!sessionStorage.getItem("authToken")) return requireLogin();
    if (!agreed) {
      setStatus({ type: "error", message: "Please agree to the terms and conditions." });
      return false;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setStatus({ type: "error", message: "Please enter your delivery address." });
      return false;
    }
    return true;
  };

  const placePickupOrder = async () => {
    if (!validateBeforePlace()) return;
    setPlacing(true);
    setStatus({ type: "", message: "" });
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await api.post(
        "/orders/checkout",
        { ...checkoutPayload, paymentMethod: "pickup" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      setStatus({
        type: "success",
        message: `Order placed! Your Order ID is: ${res?.data?.order?.orderId}`,
      });
    } catch (error) {
      setStatus({ type: "error", message: error?.response?.data?.msg || "Could not place order." });
    } finally {
      setPlacing(false);
    }
  };

  const openPaymentStep = () => {
    if (!validateBeforePlace()) return;
    setPaymentStep(true);
    setPaymentView("choose");
    setClientSecret("");
    setStatus({ type: "", message: "" });
  };

  const placeCodOrder = async () => {
    setPlacing(true);
    setStatus({ type: "", message: "" });
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await api.post(
        "/orders/checkout",
        { ...checkoutPayload, paymentMethod: "cod" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      setPaymentStep(false);
      setStatus({
        type: "success",
        message: `Order placed! Pay ${formatAmount(totals.total)} on delivery. Order ID: ${res?.data?.order?.orderId}`,
      });
    } catch (error) {
      setStatus({ type: "error", message: error?.response?.data?.msg || "Could not place order." });
    } finally {
      setPlacing(false);
    }
  };

  const startOnlinePayment = async () => {
    if (!stripePromise) {
      setStatus({
        type: "error",
        message:
          "Online payment is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY in Vercel Environment Variables, then redeploy.",
      });
      return;
    }
    setPlacing(true);
    setStatus({ type: "", message: "" });
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await api.post(
        "/orders/create-payment-intent",
        { items, deliveryType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res?.data?.clientSecret) {
        setStatus({ type: "error", message: "Stripe did not return a payment session." });
        return;
      }
      setClientSecret(res.data.clientSecret);
      setPaymentView("stripe");
    } catch (error) {
      setStatus({ type: "error", message: error?.response?.data?.msg || "Could not start payment." });
    } finally {
      setPlacing(false);
    }
  };

  const handleStripeSuccess = (order) => {
    clearCart();
    setPaymentStep(false);
    setPaymentView("choose");
    setClientSecret("");
    setStatus({
      type: "success",
      message: `Payment successful! Your Order ID is: ${order?.orderId}`,
    });
  };

  if (!items.length && status.type !== "success") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200">Your Cart</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Your cart is empty. Add some delicious food first!</p>
        <Link
          to="/foods"
          className="brand-btn mt-8 inline-block rounded-md px-6 py-3 text-sm font-semibold uppercase tracking-wide"
        >
          Browse Foods
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 sm:text-4xl">Your Cart</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {itemCount} item{itemCount === 1 ? "" : "s"} in your bag
          </p>
        </div>
        <Link to="/foods" className="text-sm font-medium text-[#ee6e73] transition hover:underline dark:text-[#f0a8ad]">
          ← Continue shopping
        </Link>
      </div>

      {status.message && (
        <p
          className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Order Items</h2>
            </div>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {items.map((item) => {
                const lineTotal = itemUnitPrice(item) * item.quantity;
                return (
                  <li key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img
                      src={item.image}
                      alt={item.fname}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{item.fname}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatAmount(itemUnitPrice(item))} each</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-600">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-lg leading-none text-zinc-700 dark:text-zinc-300"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-lg leading-none text-zinc-700 dark:text-zinc-300"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-medium text-rose-500 transition hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{formatAmount(lineTotal)}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">How would you like to receive your order?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  deliveryType === "pickup"
                    ? "border-[#ee6e73] bg-rose-50/60 dark:border-[#f0a8ad] dark:bg-[#421F37]/20"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={deliveryType === "pickup"}
                  onChange={() => setDeliveryType("pickup")}
                  className="sr-only"
                />
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Collect at Pickup Point</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pick up your food from our restaurant. No extra charges.</p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{PICKUP_ADDRESS}</p>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  deliveryType === "delivery"
                    ? "border-[#ee6e73] bg-rose-50/60 dark:border-[#f0a8ad] dark:bg-[#421F37]/20"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={deliveryType === "delivery"}
                  onChange={() => setDeliveryType("delivery")}
                  className="sr-only"
                />
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Home Delivery</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Delivered to your address. VAT 5% + ৳80 delivery fee applies.
                </p>
              </label>
            </div>

            {deliveryType === "delivery" && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="House / road / area / city / phone number"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[#ee6e73] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-[#f0a8ad]"
                />
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#ee6e73] focus:ring-[#ee6e73]"
            />
            <span className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              I agree to the terms and conditions, including order cancellation policy, delivery timing, and payment
              terms for this restaurant order.
            </span>
          </label>
        </section>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <dt>Subtotal</dt>
              <dd>{formatAmount(totals.subtotal)}</dd>
            </div>
            {deliveryType === "delivery" && (
              <>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>VAT (5%)</dt>
                  <dd>{formatAmount(totals.vat)}</dd>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>Delivery Charge</dt>
                  <dd>{formatAmount(totals.deliveryFee)}</dd>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
              <dt>Total</dt>
              <dd className="text-[#ee6e73] dark:text-[#f0a8ad]">{formatAmount(totals.total)}</dd>
            </div>
          </dl>

          {deliveryType === "pickup" ? (
            <button
              type="button"
              disabled={placing || !items.length}
              onClick={placePickupOrder}
              className="brand-btn mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          ) : (
            <button
              type="button"
              disabled={placing || !items.length}
              onClick={openPaymentStep}
              className="brand-btn mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
            >
              Place Order
            </button>
          )}

          {deliveryType === "delivery" && (
            <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-500">
              For home delivery you can pay with Cash on Delivery or Online Payment.
            </p>
          )}
        </aside>
      </div>

      {paymentStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Choose Payment Method</h3>
              <button
                type="button"
                onClick={() => {
                  setPaymentStep(false);
                  setPaymentView("choose");
                  setClientSecret("");
                }}
                className="text-2xl leading-none text-zinc-500"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Total payable: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatAmount(totals.total)}</span>
            </p>

            {status.type === "error" && status.message && paymentStep && (
              <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                {status.message}
              </p>
            )}

            {paymentView === "choose" && (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={placing}
                  onClick={placeCodOrder}
                  className="w-full rounded-xl border border-zinc-200 p-4 text-left transition hover:border-[#ee6e73] hover:bg-rose-50/50 dark:border-zinc-700 dark:hover:border-[#f0a8ad] dark:hover:bg-[#421F37]/10"
                >
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Cash on Delivery</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pay when your food arrives at your address.</p>
                </button>
                <button
                  type="button"
                  disabled={placing}
                  onClick={startOnlinePayment}
                  className="w-full rounded-xl border border-zinc-200 p-4 text-left transition hover:border-[#ee6e73] hover:bg-rose-50/50 disabled:opacity-60 dark:border-zinc-700 dark:hover:border-[#f0a8ad] dark:hover:bg-[#421F37]/10"
                >
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {placing ? "Opening Stripe..." : "Online Payment"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Pay securely with card, mobile wallet, or other supported methods.
                  </p>
                </button>
              </div>
            )}

            {paymentView === "stripe" && clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  clientSecret={clientSecret}
                  checkoutPayload={checkoutPayload}
                  onSuccess={handleStripeSuccess}
                  onCancel={() => setPaymentView("choose")}
                />
              </Elements>
            )}

            {paymentView === "stripe" && !clientSecret && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Preparing secure payment...</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
