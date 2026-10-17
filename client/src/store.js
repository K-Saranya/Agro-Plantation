import { configureStore, createSlice } from "@reduxjs/toolkit";

function load(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: load("agro_cart"),
  reducers: {
    addItem(state, action) {
      const quantity = Math.max(1, Number(action.payload.quantity) || 1);
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) existing.quantity += quantity;
      else state.push({ ...action.payload, quantity });
    },
    setQuantity(state, action) {
      const item = state.find((entry) => entry.id === action.payload.id);
      if (item) item.quantity = Math.max(1, Number(action.payload.quantity) || 1);
    },
    removeItem(state, action) {
      return state.filter((item) => item.id !== action.payload);
    },
    clearCart() {
      return [];
    },
  },
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: load("agro_wishlist"),
  reducers: {
    toggleWish(state, action) {
      const index = state.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) state.splice(index, 1);
      else state.push(action.payload);
    },
    removeWish(state, action) {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export const { toggleWish, removeWish } = wishlistSlice.actions;

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    wishlist: wishlistSlice.reducer,
  },
});

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem("agro_cart", JSON.stringify(state.cart));
  localStorage.setItem("agro_wishlist", JSON.stringify(state.wishlist));
});
