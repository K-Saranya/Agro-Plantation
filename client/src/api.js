import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agro_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(error) {
  return error?.response?.data?.message || "Something went wrong. Please try again.";
}

export function mediaUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${base}${src.startsWith("/") ? "" : "/"}${src}`;
}

export function unitPrice(product) {
  const sale = Number(product?.salePrice);
  const price = Number(product?.price || 0);
  if (Number.isFinite(sale) && sale > 0 && sale < price) return sale;
  return price;
}

export function money(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

export function shippingFor(subtotal) {
  if (!subtotal || subtotal >= 999) return 0;
  return 49;
}

export default api;
