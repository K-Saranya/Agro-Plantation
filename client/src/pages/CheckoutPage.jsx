import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { apiError, mediaUrl, money, shippingFor } from "../api";
import { clearCart } from "../store";
import { useAuth } from "../auth";
import { useAccountGate } from "../account";

const empty = {
  firstName: "",
  lastName: "",
  company: "",
  country: "India",
  street: "",
  apartment: "",
  city: "",
  state: "",
  pin: "",
  phone: "",
  email: "",
};

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart);
  const { user, ready } = useAuth();
  const requireAccount = useAccountGate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ready || user) return;
    navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [ready, user, navigate, location.pathname]);
  const [form, setForm] = useState({ ...empty, email: user?.email || "" });
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingFor(subtotal);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next = {};
    ["firstName", "lastName", "country", "street", "city", "state", "pin", "phone", "email"].forEach((field) => {
      if (!String(form[field]).trim()) next[field] = "Required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (form.pin && !/^\d{4,8}$/.test(form.pin)) next.pin = "Enter a valid PIN code";
    if (form.phone && form.phone.replace(/\D/g, "").length < 8) next.phone = "Enter a valid phone number";
    return next;
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!requireAccount()) return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length || !cart.length) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await api.post("/order/addnew", {
        items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
        billing: form,
        notes,
        paymentMethod,
      });
      dispatch(clearCart());
      const order = response.data.data;
      sessionStorage.setItem(`agro_order_${order.id}`, JSON.stringify(order));
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (error) {
      setMessage(apiError(error));
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !user) return <div className="page"><div className="skeleton tall" /></div>;

  if (!cart.length) {
    return (
      <div className="page empty">
        <h1>Nothing to check out.</h1>
        <Link className="btn" to="/shop">Return to the shop</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Checkout</p>
        <h1>Billing details</h1>
      </header>
      <form className="checkout" onSubmit={placeOrder} noValidate>
        <div className="form-grid">
          {[
            ["firstName", "First name"],
            ["lastName", "Last name"],
            ["company", "Company (optional)"],
            ["country", "Country / region"],
            ["street", "Street address"],
            ["apartment", "Apartment, suite (optional)"],
            ["city", "Town / city"],
            ["state", "State"],
            ["pin", "PIN code"],
            ["phone", "Phone"],
            ["email", "Email address"],
          ].map(([key, label]) => (
            <label key={key} className={["street", "apartment", "email"].includes(key) ? "wide" : ""}>
              {label}
              <input value={form[key]} onChange={(event) => setField(key, event.target.value)} />
              {errors[key] && <small>{errors[key]}</small>}
            </label>
          ))}
          <label className="wide">
            Order notes (optional)
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gate code, delivery window, pot colour..." />
          </label>
        </div>
        <aside className="summary">
          <h2>Your order</h2>
          {cart.map((item) => (
            <p key={item.id} className="order-line">
              <img src={mediaUrl(item.image)} alt="" />
              <span>{item.name} × {item.quantity}</span>
              <span>{money(item.price * item.quantity)}</span>
            </p>
          ))}
          <p><span>Subtotal</span><span>{money(subtotal)}</span></p>
          <p><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></p>
          <p className="total"><span>Total</span><span>{money(subtotal + shipping)}</span></p>
          <fieldset className="pay-list">
            <legend>Payment</legend>
            {["Cash on Delivery", "Direct Bank Transfer"].map((method) => (
              <label key={method} className="radio">
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                <span>{method}</span>
              </label>
            ))}
          </fieldset>
          {paymentMethod === "Direct Bank Transfer" && (
            <p className="hint">Transfer the total to Agro Plantation and use your order number as the reference. The order is held until the transfer is marked received in the studio.</p>
          )}
          {message && <p className="form-error">{message}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Placing order..." : "Place order"}</button>
          {!user && <Link className="text-link" to="/register">Create an account to track this order</Link>}
        </aside>
      </form>
    </div>
  );
}
