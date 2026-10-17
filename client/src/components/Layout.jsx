import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiHeart, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { useAuth } from "../auth";
import { useAccountGate } from "../account";

const links = [
  ["Shop", "/shop"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export default function Layout() {
  const cartCount = useSelector((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const wishCount = useSelector((state) => state.wishlist.length);
  const { user, logout } = useAuth();
  const requireAccount = useAccountGate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function search(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setOpen(false);
  }

  function guard(event, path) {
    setOpen(false);
    if (user) return;
    event.preventDefault();
    requireAccount(path);
  }

  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="announce">Free delivery on orders over Rs.999 · Nursery-fresh plants, packed with care</div>
      <header className="nav">
        <div className="nav-inner">
          <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
            <FiMenu />
          </button>
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span>Agro</span>
            <small>Plantation</small>
          </Link>
          <nav className="desk-links">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
            {user?.role === "admin" && <NavLink to="/admin">Studio</NavLink>}
          </nav>
          <form className="nav-search" onSubmit={search}>
            <FiSearch />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search plants, pots, bundles"
              aria-label="Search the nursery"
            />
          </form>
          <div className="nav-tools">
            <Link to="/wishlist" aria-label="Wishlist" className="icon-btn" onClick={(event) => guard(event, "/wishlist")}>
              <FiHeart />
              {wishCount > 0 && <em>{wishCount}</em>}
            </Link>
            <Link to="/cart" aria-label="Cart" className="icon-btn" onClick={(event) => guard(event, "/cart")}>
              <FiShoppingBag />
              {cartCount > 0 && <em>{cartCount}</em>}
            </Link>
            <Link to={user ? "/account" : "/login"} aria-label="Account" className="icon-btn account-btn">
              <FiUser />
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <strong>Menu</strong>
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={search} className="drawer-search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the nursery"
                aria-label="Search"
              />
            </form>
            {[
              ...links.map(([label, to]) => [to, label]),
              ["/wishlist", "Wishlist"],
              ["/cart", "Cart"],
              [user ? "/account" : "/login", user ? "Account" : "Sign in"],
            ].map(([to, label]) => (
                <Link key={label} to={to} onClick={(event) => (to === "/wishlist" || to === "/cart" ? guard(event, to) : setOpen(false))}>
                  {label}
                </Link>
              )
            )}
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setOpen(false)}>
                Studio
              </Link>
            )}
            {user && (
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
              >
                Log out
              </button>
            )}
          </aside>
        </div>
      )}

      <main id="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <p className="brand footer-brand">
              <span>Agro</span>
              <small>Plantation</small>
            </p>
            <p>A working nursery shop for plants, pots, and bundles — grown, packed, and delivered with the leaves intact.</p>
          </div>
          <div>
            <h2>Visit</h2>
            <p>Sivakasi, Tamil Nadu</p>
            <p>8:00am – 10:00pm · Sunday closed</p>
          </div>
          <div>
            <h2>Talk</h2>
            <p><a href="tel:+919360224725">+91 9360224725</a></p>
            <p><a href="mailto:ksaranya1104@gmail.com">ksaranya1104@gmail.com</a></p>
          </div>
          <div>
            <h2>Explore</h2>
            <Link to="/shop">Shop all</Link>
            <Link to="/about">Our nursery</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/orders">Orders</Link>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Agro Plantation</span>
          <span className="socials">
            <FaInstagram />
            <FaFacebookF />
          </span>
        </div>
      </footer>
    </div>
  );
}
