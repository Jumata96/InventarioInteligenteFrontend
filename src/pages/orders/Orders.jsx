// src/pages/orders/Orders.jsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import { useState } from "react";

export default function Orders() {
  const [rows, setRows] = useState([
    { id: 1, producto: "Laptop", cantidad: 1, precio: 2500 },
    { id: 2, producto: "Mouse", cantidad: 2, precio: 50 },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ producto: "", cantidad: 1, precio: 0 });

  const [cliente, setCliente] = useState("");
  const [pais, setPais] = useState("");

  const columns = [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "cantidad", headerName: "Cantidad", flex: 1 },
    {
      field: "precio",
      headerName: "Precio (S/)",
      flex: 1,
      renderCell: (params) => `S/ ${params.row.precio.toFixed(2)}`,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      flex: 1,
      renderCell: (params) =>
        `S/ ${(params.row.cantidad * params.row.precio).toFixed(2)}`,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAdd = () => {
    if (!form.producto || form.precio <= 0 || form.cantidad <= 0) {
      alert("Completa correctamente los campos");
      return;
    }
    const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows((prev) => [...prev, { id: newId, ...form }]);
    setOpen(false);
    setForm({ producto: "", cantidad: 1, precio: 0 });
  };

  // Calcular totales
  const subTotal = rows.reduce((acc, r) => acc + r.cantidad * r.precio, 0);
  const impuesto = subTotal * 0.18;
  const total = subTotal + impuesto;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)",
        p: 3,
      }}
    >
      <Card sx={{ borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Nuevo Pedido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registra pedidos y genera facturas fácilmente
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: 20,
                px: 3,
                background:
                  "linear-gradient(90deg, #36d1dc 0%, #5b86e5 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #2bb1bb 0%, #4a6fd3 100%)",
                },
              }}
            >
              Agregar producto
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Cliente y País */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <TextField
              label="Cliente"
              select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{ startAdornment: <PeopleIcon sx={{ mr: 1 }} /> }}
            >
              <MenuItem value="Cliente A">Cliente A</MenuItem>
              <MenuItem value="Cliente B">Cliente B</MenuItem>
            </TextField>

            <TextField
              label="País"
              select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{ startAdornment: <PublicIcon sx={{ mr: 1 }} /> }}
            >
              <MenuItem value="Perú">Perú</MenuItem>
              <MenuItem value="Ecuador">Ecuador</MenuItem>
            </TextField>
          </Box>

          {/* Tabla */}
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            disableSelectionOnClick
            pageSize={5}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 1,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "600",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#fafafa",
              },
            }}
          />

          {/* Totales */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: "column",
              alignItems: "flex-end",
              mt: 2,
              gap: 1,
            }}
          >
            <Typography>Subtotal: S/ {subTotal.toFixed(2)}</Typography>
            <Typography>Impuestos (18%): S/ {impuesto.toFixed(2)}</Typography>
            <Typography fontWeight={700}>Total: S/ {total.toFixed(2)}</Typography>
          </Box>

          {/* Guardar */}
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              sx={{
                borderRadius: 20,
                px: 3,
                background:
                  "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #0f887c 0%, #32d36f 100%)",
                },
              }}
            >
              Guardar y generar factura (PDF)
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar producto al pedido</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Producto"
            value={form.producto}
            onChange={(e) => setForm({ ...form, producto: e.target.value })}
            fullWidth
          />
          <TextField
            label="Cantidad"
            type="number"
            value={form.cantidad}
            onChange={(e) =>
              setForm({ ...form, cantidad: Number(e.target.value) })
            }
            fullWidth
          />
          <TextField
            label="Precio (S/)"
            type="number"
            value={form.precio}
            onChange={(e) =>
              setForm({ ...form, precio: Number(e.target.value) })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAdd}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
