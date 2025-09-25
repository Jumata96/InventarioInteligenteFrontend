import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../../api/endpoints";
import { Box, Card, CardContent, TextField, Button, Typography } from "@mui/material";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", cpass: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.cpass) return alert("Las contraseñas no coinciden");
    setLoading(true);
    try {
      await registerApi({ email: form.email, password: form.password });
      alert("Usuario registrado, inicia sesión");
      nav("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
    }}>
      <Card sx={{ maxWidth: 460, p: 3, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Registro de Usuario</Typography>
          <form onSubmit={onSubmit}>
            <TextField label="Correo" type="email" fullWidth sx={{ mb: 2 }}
              value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
            <TextField label="Contraseña" type="password" fullWidth sx={{ mb: 2 }}
              value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})}/>
            <TextField label="Confirmar contraseña" type="password" fullWidth sx={{ mb: 2 }}
              value={form.cpass} onChange={(e)=>setForm({...form, cpass: e.target.value})}/>
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Creando..." : "Registrarse"}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
