import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { apiError, money } from "../api";

export default function OrderPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(() => {
    if (location.state?.order) return location.state.order;
    try {
      return JSON.parse(sessionStorage.getItem(`agro_order_${id}`) || "null");
    } catch (error) {
      return null;
    }
  });
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Order received · Agro Plantation";
    if (order) return;
    api
      .get(`/order/viewById/${id}`)
      .then((response) => setOrder(response.data.data))
      .catch((err) => setError(apiError(err)));
  }, [id, order]);

  if (error) {
    return (
      <div className="page empty">
        <h1>We could not open that order.</h1>
        <p>{error}</p>
        <Link className="btn" to="/login">Sign in to view orders</Link>
      </div>
    );
  }
  if (!order) return <div className="page"><div className="skeleton tall" /></div>;

  const placed = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="page narrow">
      <header className="page-hero">
        <p className="eyebrow">Thank you</p>
        <h1>Your order has been received.</h1>
      </header>
      <div className="meta-row">
        <div><span>Order</span><strong>{order.orderNumber}</strong></div>
        <div><span>Date</span><strong>{placed}</strong></div>
        <div><span>Total</span><strong>{money(order.total)}</strong></div>
        <div><span>Payment</span><strong>{order.paymentMethod}</strong></div>
      </div>
      <div className="panel">
        <h2>Order details</h2>
        {(order.items || []).map((item) => (
          <p key={item.id} className="spread"><span>{item.name} × {item.quantity}</span><span>{money(item.lineTotal)}</span></p>
        ))}
        <p className="spread"><span>Shipping</span><span>{order.shipping ? money(order.shipping) : "Free"}</span></p>
        <p className="spread total"><span>Total</span><span>{money(order.total)}</span></p>
        <p className="hint">Status: {order.status}. We will pack this from the nursery bench.</p>
      </div>
      <Link className="btn" to="/shop">Continue shopping</Link>
    </div>
  );
}
