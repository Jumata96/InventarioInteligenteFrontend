// src/pages/Clients/Clients.jsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Autocomplete,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, CheckCircle, Block } from "@mui/icons-material";
import {
  getClientesPaged,
  createCliente,
  updateCliente,
  deleteCliente,
  enableCliente,
  disableCliente,
  getPaises,
} from "../../api/endpoints";
import ConfirmDialog from "../../components/ConfirmDialog";
import { ESTADOS, getEstadoLabel, getEstadoIcon } from "../../utils/status";

export default function Clients() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paises, setPaises] = useState([]);

  // Modal crear/editar
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    ruc: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    paisId: "",
  });

  // Confirmación de eliminar
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [rowCount, setRowCount] = useState(0);

  // 🔹 Cargar datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const dataClientes = await getClientesPaged(page, pageSize);
      const dataPaises = await getPaises();

      // Ajuste: API devuelve "data" y "totalCount"
      setRows(Array.isArray(dataClientes.data) ? dataClientes.data : []);
      setRowCount(dataClientes.totalCount ?? 0);

      setPaises(dataPaises);
    } catch (err) {
      console.error("Error cargando clientes/paises", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  // 🔹 Mapear paisId -> nombre
  const getPaisNombre = (id) => {
    if (!id) return "No definido";
    const pais = paises.find((p) => p.paisId === id);
    return pais ? pais.nombre : "No definido";
  };

  // 🔹 Nuevo cliente
  const handleNew = () => {
    setEditing(null);
    setForm({ ruc: "", nombre: "", email: "", telefono: "", direccion: "", paisId: "" });
    setOpen(true);
  };

  // 🔹 Editar cliente
  const handleEdit = (row) => {
    setEditing(row);
    setForm({
      ruc: row.ruc,
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      direccion: row.direccion || "",
      paisId: row.paisId,
    });
    setOpen(true);
  };

  // 🔹 Guardar cliente
  const handleSave = async () => {
    if (!form.ruc || !form.nombre || !form.paisId) {
      return alert("Completa todos los campos obligatorios");
    }

    try {
      if (editing) {
        await updateCliente(editing.clienteId, form);
      } else {
        await createCliente(form);
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error guardando cliente:", err);
      alert("No se pudo guardar el cliente");
    }
  };

  // 🔹 Confirmación de eliminar
  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setOpenConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCliente(deleteId);
      fetchData();
    } catch {
      alert("No se pudo eliminar el cliente");
    } finally {
      setOpenConfirm(false);
      setDeleteId(null);
    }
  };

  // 🔹 Habilitar / Deshabilitar
  const handleToggleEstado = async (row) => {
    try {
      if (row.estado === ESTADOS.ACTIVO) {
        await disableCliente(row.clienteId);
      } else if (row.estado === ESTADOS.DESHABILITADO) {
        await enableCliente(row.clienteId);
      }
      fetchData();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("No se pudo cambiar el estado del cliente");
    }
  };

  const columns = [
    { field: "ruc", headerName: "RUC", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    { field: "direccion", headerName: "Dirección", flex: 1 }, 
    {
      field: "paisNombre",
      headerName: "País",
      flex: 1
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 160,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {getEstadoIcon(params.value)}
          <span>{getEstadoLabel(params.value)}</span>
        </Stack>
      ),
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
            <IconButton color="error" onClick={() => handleDeleteRequest(params.row.clienteId)} title="Eliminar">
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
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Clientes
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNew}
              sx={{ background: "linear-gradient(45deg, #2196F3, #21CBF3)", color: "white", borderRadius: 2 }}
            >
              Nuevo Cliente
            </Button>
          </Box>
          <DataGrid
            autoHeight
            loading={loading}
            rows={rows}
            columns={columns}
            getRowId={(row) => row.clienteId}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="RUC" fullWidth value={form.ruc} onChange={(e)=>setForm({...form, ruc: e.target.value})}/>
            <TextField label="Nombre" fullWidth value={form.nombre} onChange={(e)=>setForm({...form, nombre: e.target.value})}/>
            <TextField label="Email" fullWidth value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
            <TextField label="Teléfono" fullWidth value={form.telefono} onChange={(e)=>setForm({...form, telefono: e.target.value})}/>
            <TextField label="Dirección" fullWidth value={form.direccion} onChange={(e)=>setForm({...form, direccion: e.target.value})}/>

            {/* Autocomplete para país */}
            <Autocomplete
              options={paises}
              getOptionLabel={(option) => `${option.codigo} - ${option.nombre}`}
              value={paises.find((p) => p.paisId === form.paisId) || null}
              onChange={(e, newValue) =>
                setForm({ ...form, paisId: newValue ? newValue.paisId : "" })
              }
              renderInput={(params) => (
                <TextField {...params} label="País" fullWidth />
              )}
            />
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
        message="¿Seguro que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Box>
  );
}
