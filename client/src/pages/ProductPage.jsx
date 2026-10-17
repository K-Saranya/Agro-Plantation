import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { apiError, mediaUrl, money, unitPrice } from "../api";
import { addItem, toggleWish } from "../store";
import { useToast } from "../toast";
import { useAccountGate } from "../account";
import ProductCard from "../components/ProductCard";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [active, setActive] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const toast = useToast();
  const requireAccount = useAccountGate();
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    api
      .get(`/product/viewById/${id}`)
      .then((response) => {
        const item = response.data;
        setProduct(item);
        setActive(item.img);
        document.title = `${item.name} · Agro Plantation`;
        return api.get("/product/viewAll", {
          params: { paged: 1, limit: 4, category: item.category },
        });
      })
      .then((response) => setRelated((response.data.data || []).filter((item) => String(item.id) !== String(id))))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="skeleton tall" /></div>;
  if (error || !product) {
    return (
      <div className="page empty">
        <h1>Plant not found</h1>
        <p>{error || "This listing is no longer in the catalogue."}</p>
        <Link className="btn" to="/shop">Back to the shop</Link>
      </div>
    );
  }

  const price = unitPrice(product);
  const images = [product.img, product.cover1, product.cover2, product.cover3, product.cover4].filter(Boolean);
  const unique = [...new Set(images)];
  const saved = wishlist.some((item) => item.id === product.id);
  const inCart = cart.find((item) => item.id === product.id)?.quantity || 0;

  function addToCart() {
    if (!requireAccount()) return;
    if (inCart + quantity > product.quantety) {
      toast(`Only ${product.quantety} available.`, "bad");
      return;
    }
    dispatch(addItem({ id: product.id, name: product.name, price, image: product.img, stock: product.quantety, quantity }));
    toast("Added to your cart.");
  }

  return (
    <div className="page">
      <p className="crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / {product.name}
      </p>
      <section className="pdp">
        <div>
          <div className="pdp-main">
            <img src={mediaUrl(active || product.img)} alt={product.name} />
          </div>
          <div className="thumbs">
            {unique.map((image) => (
              <button type="button" key={image} className={active === image ? "on" : ""} onClick={() => setActive(image)}>
                <img src={mediaUrl(image)} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="pdp-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="price-row large">
            <strong>{money(price)}</strong>
            {price < Number(product.price) && <s>{money(product.price)}</s>}
          </div>
          <p>{product.dec}</p>
          <p className="stock">{product.quantety > 0 ? `${product.quantety} in stock` : "Out of stock"}</p>
          <div className="qty">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
            <input
              aria-label="Quantity"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
            <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn" onClick={addToCart} disabled={product.quantety < 1}>
              Add to cart
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                if (!requireAccount()) return;
                dispatch(toggleWish({ id: product.id, name: product.name, price, image: product.img, stock: product.quantety }));
                toast(saved ? "Removed from wishlist." : "Saved to your wishlist.");
              }}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
          <ul className="fine">
            <li>Ships in protective nursery packaging.</li>
            <li>Free delivery over Rs.999. Otherwise a flat Rs.49.</li>
            <li>Cash on delivery or direct bank transfer.</li>
          </ul>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section tight">
          <div className="section-head">
            <h2>More in {product.category}</h2>
          </div>
          <div className="grid">{related.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  );
}
