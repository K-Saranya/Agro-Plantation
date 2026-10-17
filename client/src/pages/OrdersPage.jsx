import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiError, money } from "../api";
import { useAuth } from "../auth";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Orders · Agro Plantation";
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get("/order/mine")
      .then((response) => setOrders(response.data.data || []))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [user, ready]);

  if (!ready || loading) return <div className="page"><div className="skeleton tall" /></div>;
  if (!user) {
    return (
      <div className="page empty">
        <h1>Sign in to see your orders.</h1>
        <Link className="btn" to="/login?next=%2Forders">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Account</p>
        <h1>Your orders</h1>
      </header>
      {error && <p className="form-error">{error}</p>}
      {!orders.length ? (
        <div className="empty">
          <h2>No orders yet.</h2>
          <Link className="btn" to="/shop">Start with the shop</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="status">{order.status}</td>
                  <td>{money(order.total)}</td>
                  <td><Link to={`/order/${order.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
