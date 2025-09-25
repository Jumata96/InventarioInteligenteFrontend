import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));

  const isAuthenticated = !!token;

  useEffect(() => {
    // si al recargar ya hay token, mantenemos sesión
    const t = localStorage.getItem("token");
    const e = localStorage.getItem("email");
    if (t) setToken(t);
    if (e) setEmail(e);
  }, []);

  const login = ({ token, email }) => {
    localStorage.setItem("token", token);
    if (email) localStorage.setItem("email", email);
    setToken(token);
    setEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
