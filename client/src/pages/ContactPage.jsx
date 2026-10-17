import { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { useAccountGate } from "../account";
import { useAuth } from "../auth";

const empty = { name: "", email: "", phone: "", message: "" };

export default function ContactPage() {
  const { user } = useAuth();
  const requireAccount = useAccountGate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Contact · Agro Plantation";
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    if (!requireAccount()) return;
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.message.trim().length < 8) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage("");
    try {
      await api.post("/contact/addnew", form);
      setForm(empty);
      setMessage("Message sent. We will reply from the nursery desk.");
    } catch (error) {
      setMessage(apiError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Get in touch.</h1>
      </header>
      <div className="contact">
        <form className="stack" onSubmit={submit} noValidate>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />{errors.name && <small>{errors.name}</small>}</label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />{errors.email && <small>{errors.email}</small>}</label>
          <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Your message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />{errors.message && <small>{errors.message}</small>}</label>
          {message && <p className={message.startsWith("Message sent") ? "form-ok" : "form-error"}>{message}</p>}
          <button className="btn" disabled={busy} type="submit">{busy ? "Sending..." : "Send message"}</button>
        </form>
        <aside className="panel">
          <p><strong>Address</strong><br />Sivakasi, Tamil Nadu</p>
          <p><strong>Phone</strong><br /><a href="tel:+919360224725">+91 9360224725</a></p>
          <p><strong>Email</strong><br /><a href="mailto:ksaranya1104@gmail.com">ksaranya1104@gmail.com</a></p>
          <p><strong>Opening time</strong><br />8:00am – 10:00pm, Sunday closed</p>
          <iframe
            title="Sivakasi map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31483.87192592191!2d77.78261171083638!3d9.466562849236409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee43d812d0d%3A0x8ce12e9dcdaa2a2c!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1792216749607!5m2!1sen!2sin"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </aside>
      </div>
    </div>
  );
}
