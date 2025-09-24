import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";

// Datos simulados (mock)
const clientesMock = [
  { id: 1, ruc: "20123456789", nombre: "Cliente A" },
  { id: 2, ruc: "20567891234", nombre: "Cliente B" },
  { id: 3, ruc: "20987654321", nombre: "Cliente C" },
];

const productosMock = [
  { id: 1, nombre: "Laptop", precio: 2500 },
  { id: 2, nombre: "Mouse", precio: 50 },
  { id: 3, nombre: "Teclado", precio: 100 },
];

export default function Orders() {
  const [cliente, setCliente] = useState(null);
  const [pais, setPais] = useState("Perú");
  const [rows, setRows] = useState([]);

  // Agregar producto simulado
  const addProducto = () => {
    if (!productosMock.length) return;
    const random = productosMock[Math.floor(Math.random() * productosMock.length)];
    const nuevo = {
      id: rows.length + 1,
      producto: random.nombre,
      cantidad: 1,
      precio: random.precio,
      subtotal: random.precio,
    };
    setRows([...rows, nuevo]);
  };

  // Eliminar producto
  const deleteProducto = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Columnas de DataGrid
  const columns = [
    { field: "producto", headerName: "Producto", flex: 1 },
    { field: "cantidad", headerName: "Cantidad", width: 120 },
    {
      field: "precio",
      headerName: "Precio (S/)",
      width: 150,
      valueFormatter: (params) => `S/ ${params.value.toFixed(2)}`,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      width: 150,
      valueFormatter: (params) => `S/ ${params.value.toFixed(2)}`,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => deleteProducto(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const subtotal = rows.reduce((acc, r) => acc + r.subtotal, 0);
  const impuestos = subtotal * 0.18;
  const total = subtotal + impuestos;

  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        background: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
        minHeight: "100vh",
      }}
    >
      <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
        <CardHeader
          title="Nuevo Pedido"
          subheader="Registra pedidos y genera facturas fácilmente"
        />
        <CardContent>
          {/* Cliente y País */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            {/* Autocomplete para cliente */}
            <Autocomplete
              options={clientesMock}
              getOptionLabel={(option) =>
                `${option.ruc} - ${option.nombre}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar cliente por RUC o Nombre"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  fullWidth
                />
              )}
              value={cliente}
              onChange={(e, value) => setCliente(value)}
              sx={{ minWidth: 300 }}
            />

            {/* País */}
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

            {/* Botón agregar producto */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addProducto}
              sx={{
                background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                borderRadius: 2,
                fontWeight: "bold",
                ml: "auto",
              }}
            >
              Agregar Producto
            </Button>
          </Box>

          {/* Tabla de productos */}
          <Box sx={{ height: 300, mb: 2 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              disableSelectionOnClick
            />
          </Box>

          {/* Totales */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Typography>Subtotal: S/ {subtotal.toFixed(2)}</Typography>
            <Typography>Impuestos (18%): S/ {impuestos.toFixed(2)}</Typography>
            <Typography variant="h6" fontWeight="bold">
              Total: S/ {total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
