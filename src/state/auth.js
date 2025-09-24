import { create } from "zustand";

export const useAuth = create((set) => ({
  token: localStorage.getItem("token") || null,
  email: localStorage.getItem("email") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: ({ token, email }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    set({ token, email, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    set({ token: null, email: null, isAuthenticated: false });
  },
}));
