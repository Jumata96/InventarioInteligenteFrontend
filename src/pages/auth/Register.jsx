// src/pages/auth/Register.jsx
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = data.get("password");
    const password2 = data.get("password2");

    if (password !== password2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log({
      email: data.get("email"),
      password,
    });

    nav("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            backdropFilter: "blur(6px)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, color: "#333" }}
            >
              Crear Cuenta
            </Typography>
            <Typography
              align="center"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Regístrate para acceder al sistema
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Confirmar contraseña"
                name="password2"
                type="password"
                fullWidth
                required
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(90deg, #ff758c 0%, #ff7eb3 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #fa5788 0%, #ff4da6 100%)",
                  },
                }}
              >
                Registrarse
              </Button>

              <Typography align="center" sx={{ mt: 2 }}>
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" underline="hover" color="primary">
                  Inicia sesión
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
