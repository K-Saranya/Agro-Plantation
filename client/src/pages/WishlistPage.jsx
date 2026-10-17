import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mediaUrl, money } from "../api";
import { addItem, removeWish } from "../store";
import { useToast } from "../toast";
import { useAuth } from "../auth";
import { useAccountGate } from "../account";

export default function WishlistPage() {
  const items = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const toast = useToast();
  const { user, ready } = useAuth();
  const requireAccount = useAccountGate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ready || user) return;
    navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [ready, user, navigate, location.pathname]);

  if (!ready || !user) return <div className="page"><div className="skeleton tall" /></div>;

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Wishlist</p>
        <h1>Saved for later.</h1>
      </header>
      {items.length === 0 ? (
        <div className="empty">
          <h2>No saved plants yet.</h2>
          <p>Tap the heart on any plant to keep it here.</p>
          <Link className="btn" to="/shop">Explore the shop</Link>
        </div>
      ) : (
        <div className="lines">
          {items.map((item) => (
            <article key={item.id} className="line">
              <img src={mediaUrl(item.image)} alt="" />
              <div>
                <h2><Link to={`/product/${item.id}`}>{item.name}</Link></h2>
                <p>{money(item.price)}</p>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (!requireAccount()) return;
                  dispatch(addItem({ ...item, quantity: 1 }));
                  toast("Moved into your cart.");
                }}
              >
                Add to cart
              </button>
              <button type="button" className="text-btn" onClick={() => { if (requireAccount()) dispatch(removeWish(item.id)); }}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
