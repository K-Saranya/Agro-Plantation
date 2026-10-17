import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { apiError, mediaUrl, money } from "../api";
import { useAuth } from "../auth";

const blankProduct = {
  name: "",
  price: "",
  salePrice: "",
  quantety: "",
  category: "",
  dec: "",
  img: "",
  cover1: "",
  cover2: "",
  cover3: "",
  cover4: "",
};

const statuses = ["received", "processing", "shipped", "delivered", "cancelled"];

export default function AdminPage() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [stories, setStories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [story, setStory] = useState({ name: "", content: "", img: "" });
  const [query, setQuery] = useState("");

  async function load() {
    const [sum, productRes, storyRes, orderRes, messageRes, userRes] = await Promise.all([
      api.get("/order/summary"),
      api.get("/product/viewAll"),
      api.get("/testimonial/viewAll"),
      api.get("/order/viewAll"),
      api.get("/contact/viewAll"),
      api.get("/auth/viewAll"),
    ]);
    setSummary(sum.data.data);
    setProducts(productRes.data);
    setStories(storyRes.data);
    setOrders(orderRes.data.data || []);
    setMessages(messageRes.data.data || []);
    setUsers(userRes.data || []);
  }

  useEffect(() => {
    document.title = "Studio · Agro Plantation";
    if (!ready || user?.role !== "admin") return;
    load().catch((err) => setError(apiError(err)));
  }, [ready, user]);

  if (!ready) return <div className="page"><div className="skeleton tall" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  async function saveProduct(event) {
    event.preventDefault();
    setError("");
    try {
      if (editing.id) await api.post(`/product/update/${editing.id}`, editing);
      else await api.post("/product/addnew", editing);
      setEditing(null);
      setNotice("Catalogue updated.");
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    try {
      const response = await api.post("/product/upload", body);
      setEditing((current) => ({ ...current, img: response.data.url, cover1: current.cover1 || response.data.url }));
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function removeProduct(id) {
    if (!window.confirm("Remove this plant from the catalogue?")) return;
    await api.post(`/product/delete/${id}`);
    await load();
  }

  async function saveStory(event) {
    event.preventDefault();
    try {
      if (story.id) await api.post(`/testimonial/update/${story.id}`, story);
      else await api.post("/testimonial/addnew", story);
      setStory({ name: "", content: "", img: "" });
      setNotice("Review saved.");
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function changeStatus(order, status) {
    try {
      await api.post(`/order/status/${order.id}`, { status });
      setNotice(`Order ${order.orderNumber} is now ${status}.`);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Studio</p>
        <h1>Nursery desk</h1>
      </header>
      <div className="tabs">
        {["overview", "products", "reviews", "orders", "messages", "accounts"].map((name) => (
          <button key={name} type="button" className={tab === name ? "on" : ""} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-ok">{notice}</p>}

      {tab === "overview" && summary && (
        <div>
          <div className="stats">
            {[
              ["Revenue", money(summary.revenue)],
              ["Orders", summary.orders],
              ["Plants", summary.products],
              ["Accounts", summary.users],
              ["Low stock", summary.lowStock],
            ].map(([label, value]) => (
              <article key={label}><span>{label}</span><strong>{value}</strong></article>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Recent order</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                {(summary.recentOrders || []).map((order) => (
                  <tr key={order.id}><td>{order.orderNumber}</td><td>{order.status}</td><td>{money(order.total)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div>
          <div className="shop-bar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter catalogue" aria-label="Filter products" />
            <button type="button" className="btn" onClick={() => setEditing({ ...blankProduct })}>Add plant</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td><img className="thumb" src={mediaUrl(product.img)} alt="" /></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{money(product.salePrice && product.salePrice < product.price ? product.salePrice : product.price)}</td>
                    <td>{product.quantety}</td>
                    <td className="row-actions">
                      <button type="button" onClick={() => setEditing({ ...product, salePrice: product.salePrice ?? "" })}>Edit</button>
                      <button type="button" onClick={() => removeProduct(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="admin-split">
          <form className="stack panel" onSubmit={saveStory}>
            <h2>{story.id ? "Edit review" : "New review"}</h2>
            <label>Name<input value={story.name} onChange={(event) => setStory({ ...story, name: event.target.value })} /></label>
            <label>Photo URL<input value={story.img} onChange={(event) => setStory({ ...story, img: event.target.value })} /></label>
            <label>Review<textarea value={story.content} onChange={(event) => setStory({ ...story, content: event.target.value })} /></label>
            <button className="btn" type="submit">Save review</button>
          </form>
          <div className="stack">
            {stories.map((item) => (
              <article key={item.id} className="panel">
                <strong>{item.name}</strong>
                <p>{item.content}</p>
                <div className="row-actions">
                  <button type="button" onClick={() => setStory(item)}>Edit</button>
                  <button type="button" onClick={async () => { await api.post(`/testimonial/delete/${item.id}`); await load(); }}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.billing?.email}</td>
                  <td>{money(order.total)}</td>
                  <td>
                    <select value={order.status} onChange={(event) => changeStatus(order, event.target.value)} aria-label={`Status for ${order.orderNumber}`}>
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "messages" && (
        <div className="stack">
          {!messages.length && <div className="empty"><h2>No messages yet.</h2></div>}
          {messages.map((item) => (
            <article key={item.id} className="panel">
              <strong>{item.name}</strong>
              <p>{item.email} {item.phone && `· ${item.phone}`}</p>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "accounts" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id}><td>{account.name}</td><td>{account.email}</td><td>{account.role}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={saveProduct}>
            <div className="drawer-head">
              <h2>{editing.id ? "Edit plant" : "Add plant"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">×</button>
            </div>
            <div className="form-grid">
              {[
                ["name", "Name"],
                ["category", "Category"],
                ["price", "Price"],
                ["salePrice", "Sale price"],
                ["quantety", "Stock"],
                ["img", "Image path"],
                ["cover1", "Cover 1"],
                ["cover2", "Cover 2"],
                ["cover3", "Cover 3"],
                ["cover4", "Cover 4"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input value={editing[key] ?? ""} onChange={(event) => setEditing({ ...editing, [key]: event.target.value })} />
                </label>
              ))}
              <label className="wide">Description<textarea value={editing.dec || ""} onChange={(event) => setEditing({ ...editing, dec: event.target.value })} /></label>
              <label>Upload image<input type="file" accept="image/*" onChange={upload} /></label>
            </div>
            <button className="btn" type="submit">Save plant</button>
          </form>
        </div>
      )}
    </div>
  );
}
