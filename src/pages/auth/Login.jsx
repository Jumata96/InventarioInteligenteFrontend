import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { Box, Card, CardContent, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(form);
      const token = res?.token || res?.accessToken || res;
      if (!token) throw new Error("Token inválido");
      login({ token, email: form.email });
      nav("/products");
    } catch (err) {
      alert(err?.response?.data?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #74ebd5 0%, #9face6 100%)",
    }}>
      <Card sx={{ maxWidth: 420, p: 3, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>
          <form onSubmit={onSubmit}>
            <TextField label="Correo" type="email" fullWidth sx={{ mb: 2 }}
              value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
            <TextField label="Contraseña" type="password" fullWidth sx={{ mb: 2 }}
              value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})}/>
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
