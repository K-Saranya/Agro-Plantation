import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { mediaUrl, money, unitPrice } from "../api";
import { addItem, toggleWish } from "../store";
import { useToast } from "../toast";
import { useAccountGate } from "../account";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const requireAccount = useAccountGate();
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);
  const saved = wishlist.some((item) => item.id === product.id);
  const price = unitPrice(product);
  const onSale = price < Number(product.price);
  const cover = mediaUrl(product.img);
  const altCover = mediaUrl(product.cover2 || product.cover1 || product.img);

  function addToCart(event) {
    event.preventDefault();
    if (!requireAccount()) return;
    const inCart = cart.find((item) => item.id === product.id)?.quantity || 0;
    if (product.quantety < 1 || inCart >= product.quantety) {
      toast(product.quantety < 1 ? "This plant is out of stock." : "That is all we have in stock.", "bad");
      return;
    }
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price,
        image: product.img,
        stock: product.quantety,
        quantity: 1,
      })
    );
    toast(`${product.name} added to your cart.`);
  }

  function wish(event) {
    event.preventDefault();
    if (!requireAccount()) return;
    dispatch(
      toggleWish({
        id: product.id,
        name: product.name,
        price,
        image: product.img,
        stock: product.quantety,
      })
    );
    toast(saved ? "Removed from wishlist." : "Saved to your wishlist.");
  }

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-media">
        <img src={cover} alt={product.name} />
        <img src={altCover} alt="" className="alt" />
        {onSale && <span className="badge">Sale</span>}
        {product.quantety < 1 && <span className="badge sold">Sold out</span>}
      </Link>
      <div className="card-body">
        <p className="eyebrow">{product.category}</p>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="price-row">
          <strong>{money(price)}</strong>
          {onSale && <s>{money(product.price)}</s>}
        </div>
        <div className="card-actions">
          <button type="button" onClick={addToCart} disabled={product.quantety < 1}>
            <FiShoppingBag /> Add
          </button>
          <button type="button" className={saved ? "ghost on" : "ghost"} onClick={wish} aria-label="Save to wishlist">
            <FiHeart />
          </button>
        </div>
      </div>
    </article>
  );
}
