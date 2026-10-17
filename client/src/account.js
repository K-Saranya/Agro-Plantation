import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { useToast } from "./toast";

export function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  if (value.startsWith("/login") || value.startsWith("/register") || value.startsWith("/forgot-password")) return "";
  return value;
}

export function useAccountGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  return function requireAccount(path) {
    if (user) return true;
    const next = path || `${location.pathname}${location.search}`;
    toast("Sign in or create an account to continue.", "bad");
    navigate(`/login?next=${encodeURIComponent(next)}`);
    return false;
  };
}
