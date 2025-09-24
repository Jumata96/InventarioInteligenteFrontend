// src/pages/auth/Login.jsx
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

export default function Login() {
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    nav("/products"); // temporal
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
              Inventario Inteligente
            </Typography>
            <Typography
              align="center"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Inicia sesión para continuar
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(0deg, #ff758c 0%, #ff7eb3 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)",
                  },
                }}
              >
                Ingresar
              </Button>
              <Typography align="center" sx={{ mt: 2 }}>
                ¿No tienes cuenta?{" "}
                <Link href="/register" underline="hover" color="primary">
                  Regístrate
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
