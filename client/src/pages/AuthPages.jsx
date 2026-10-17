import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { apiError, mediaUrl } from "../api";
import { useAuth } from "../auth";
import { safeNext } from "../account";

function AuthShell({ title, lede, children }) {
  return (
    <div className="auth">
      <div className="auth-panel">
        <Link to="/" className="brand"><span>Agro</span><small>Plantation</small></Link>
        <h1>{title}</h1>
        <p>{lede}</p>
        {children}
      </div>
      <img className="auth-art" src={mediaUrl("/media/banner-8.jpg")} alt="Greenhouse foliage" />
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await login(email, password);
      navigate(next || (user.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Sign in" lede={next ? "Sign in to continue. An account is required before you can do that." : "Use the account you created for the nursery."}>
      <form className="stack" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" disabled={busy} type="submit">{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="auth-links"><Link to="/forgot-password">Lost your password?</Link><Link to={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}>Create an account</Link></p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate(next || "/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create an account" lede={next ? "Create an account to continue. You will come back to where you left off." : "Orders placed after you sign in stay attached to this email."}>
      <form className="stack" onSubmit={submit}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" disabled={busy} type="submit">{busy ? "Creating..." : "Create account"}</button>
      </form>
      <p className="auth-links"><Link to={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Already have an account</Link></p>
    </AuthShell>
  );
}

export function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/forgetpassword", { email, newPassword: password });
      setMessage("Password updated. You can sign in with the new one.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Update password" lede="Enter the email on the account and a new password.">
      <form className="stack" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-ok">{message}</p>}
        <button className="btn" disabled={busy} type="submit">{busy ? "Updating..." : "Update password"}</button>
      </form>
      <p className="auth-links"><Link to="/login">Back to sign in</Link></p>
    </AuthShell>
  );
}
