import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { apiError } from "../api";

export default function AccountPage() {
  const { user, ready, updateProfile, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="page"><div className="skeleton tall" /></div>;
  if (!user) {
    return (
      <div className="page empty">
        <h1>Sign in to your account.</h1>
        <Link className="btn" to="/login?next=%2Faccount">Sign in</Link>
      </div>
    );
  }

  const current = form || { name: user.name || "", email: user.email || "", password: "" };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = { name: current.name, email: current.email };
      if (current.password) payload.password = current.password;
      await updateProfile(payload);
      setForm({ ...current, password: "" });
      setMessage("Account updated.");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow">
      <header className="page-hero">
        <p className="eyebrow">{user.role === "admin" ? "Admin" : "Customer"}</p>
        <h1>Your account</h1>
      </header>
      <form className="stack panel" onSubmit={submit}>
        <label>Name<input value={current.name} onChange={(event) => setForm({ ...current, name: event.target.value })} /></label>
        <label>Email<input type="email" value={current.email} onChange={(event) => setForm({ ...current, email: event.target.value })} /></label>
        <label>New password<input type="password" value={current.password} placeholder="Leave blank to keep the current password" onChange={(event) => setForm({ ...current, password: event.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-ok">{message}</p>}
        <button className="btn" disabled={busy} type="submit">{busy ? "Saving..." : "Save changes"}</button>
      </form>
      <div className="hero-actions">
        <Link className="btn ghost" to="/orders">View orders</Link>
        {user.role === "admin" && <Link className="btn ghost" to="/admin">Open studio</Link>}
        <button type="button" className="text-btn" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
