import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { mediaUrl, money } from "../api";
import { removeItem, setQuantity } from "../store";
import { useAuth } from "../auth";
import { useAccountGate } from "../account";

export default function CartPage() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user, ready } = useAuth();
  const requireAccount = useAccountGate();
  const navigate = useNavigate();
  const location = useLocation();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!ready || user) return;
    navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [ready, user, navigate, location.pathname]);

  if (!ready || !user) return <div className="page"><div className="skeleton tall" /></div>;

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Cart</p>
        <h1>Your plants, ready to travel.</h1>
      </header>
      {cart.length === 0 ? (
        <div className="empty">
          <h2>The cart is empty.</h2>
          <p>Add a plant from the shop and it will stay here, even if you refresh.</p>
          <Link className="btn" to="/shop">Browse plants</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="lines">
            {cart.map((item) => (
              <article key={item.id} className="line">
                <img src={mediaUrl(item.image)} alt="" />
                <div>
                  <h2><Link to={`/product/${item.id}`}>{item.name}</Link></h2>
                  <p>{money(item.price)}</p>
                  <button type="button" className="text-btn" onClick={() => { if (requireAccount()) dispatch(removeItem(item.id)); }}>
                    Remove
                  </button>
                </div>
                <div className="qty">
                  <button type="button" onClick={() => { if (requireAccount()) dispatch(setQuantity({ id: item.id, quantity: item.quantity - 1 })); }} aria-label="Decrease">−</button>
                  <input
                    aria-label={`Quantity for ${item.name}`}
                    value={item.quantity}
                    onChange={(event) => { if (requireAccount()) dispatch(setQuantity({ id: item.id, quantity: Number(event.target.value) || 1 })); }}
                  />
                  <button type="button" onClick={() => { if (requireAccount()) dispatch(setQuantity({ id: item.id, quantity: Math.min(item.stock || 99, item.quantity + 1) })); }} aria-label="Increase">+</button>
                </div>
                <strong>{money(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary">
            <h2>Summary</h2>
            <p><span>Subtotal</span><span>{money(subtotal)}</span></p>
            <p className="hint">Shipping is calculated at checkout. Orders over Rs.999 travel free.</p>
            <Link className="btn" to="/checkout">Checkout</Link>
            <Link className="text-link" to="/shop">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
