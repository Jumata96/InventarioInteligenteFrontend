import {
  Box, Button, Card, CardContent, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, TextField, Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Delete, Edit, CheckCircle, Block } from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  getProductosPaged, createProducto, updateProducto, deleteProducto,
  enableProducto, disableProducto
} from "../../api/endpoints";
import ConfirmDialog from "../../components/ConfirmDialog";
import { ESTADOS, getEstadoLabel, getEstadoIcon } from "../../utils/status";

export default function Products() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal de crear/editar
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "" });

  // Confirmación de eliminar
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Paginación (modelo controlado)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [rowCount, setRowCount] = useState(0);

  // Búsqueda con debounce interno
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginationModel((prev) => ({ ...prev, page: 0 })); // resetear página al buscar
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  //  Cargar productos
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProductosPaged(
        paginationModel.page,
        paginationModel.pageSize,
        debouncedSearch
      );
      setRows(Array.isArray(data.items) ? data.items : []);
      setRowCount(data.totalCount ?? 0);
    } catch (e) {
      console.error("Error cargando productos:", e);
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch]);

  // Nuevo producto
  const handleNew = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", precio: "", stock: "" });
    setOpen(true);
  };

  // Editar producto
  const handleEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: row.precio,
      stock: row.stock
    });
    setOpen(true);
  };

  // Guardar producto
  const handleSave = async () => {
    const precio = Number(form.precio);
    const stock = Number(form.stock);
    if (!form.nombre || precio <= 0 || stock < 0) {
      return alert("Completa los campos válidos");
    }

    try {
      if (editing) {
        await updateProducto(editing.productoId, { ...form, precio, stock });
      } else {
        await createProducto({ ...form, precio, stock });
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error guardando producto:", err);
      alert("No se pudo guardar el producto");
    }
  };

  // Confirmación de eliminar
  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setOpenConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProducto(deleteId);
      fetchData();
    } catch {
      alert("No se pudo eliminar el producto");
    } finally {
      setOpenConfirm(false);
      setDeleteId(null);
    }
  };

  // Toggle estado (habilitar/deshabilitar)
  const handleToggleEstado = async (row) => {
    try {
      if (row.estado === ESTADOS.ACTIVO) {
        await disableProducto(row.productoId);
      } else if (row.estado === ESTADOS.DESHABILITADO) {
        await enableProducto(row.productoId);
      }
      fetchData();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("No se pudo cambiar el estado del producto");
    }
  };

  // Definir columnas
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "descripcion", headerName: "Descripción", flex: 1 },
    {
      field: "precio",
      headerName: "Precio (S/)",
      width: 160,
      valueFormatter: (p) => {
        const raw = Number(p ?? 0);
        if (isNaN(raw)) return "S/ 0.00";
        return raw.toLocaleString("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    },
    { field: "stock", headerName: "Stock", width: 110 },
    {
      field: "estado",
      headerName: "Estado",
      width: 160,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {getEstadoIcon(params.value)}
          <span>{getEstadoLabel(params.value)}</span>
        </Stack>
      )
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 220,
      renderCell: (params) => {
        if (params.row.estado === ESTADOS.ELIMINADO) return null;
        return (
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" onClick={() => handleEdit(params.row)} title="Editar">
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => handleDeleteRequest(params.row.productoId)} title="Eliminar">
              <Delete />
            </IconButton>
            {params.row.estado === ESTADOS.ACTIVO ? (
              <IconButton color="warning" onClick={() => handleToggleEstado(params.row)} title="Deshabilitar">
                <Block />
              </IconButton>
            ) : (
              <IconButton color="success" onClick={() => handleToggleEstado(params.row)} title="Habilitar">
                <CheckCircle />
              </IconButton>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Catálogo de Productos</Typography>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              label="Buscar producto"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNew}
              sx={{
                background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                color: "white",
                borderRadius: 2
              }}
            >
              Nuevo Producto
            </Button>
          </Box>
          <DataGrid
            autoHeight
            loading={loading}
            rows={rows}
            columns={columns}
            getRowId={(r) => r.productoId}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Nombre" fullWidth value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="Descripción" fullWidth value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <TextField label="Precio" type="number" fullWidth value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            <TextField label="Stock" type="number" fullWidth value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de eliminar */}
      <ConfirmDialog
        open={openConfirm}
        title="Confirmar eliminación"
        message="¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Box>
  );
}
