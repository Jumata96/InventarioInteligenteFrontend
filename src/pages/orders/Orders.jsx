import {
  Box, Card, CardContent, Typography, Button, TextField,
  Autocomplete, MenuItem, Select, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import {
  getClientes, getPaises, getProductos, getImpuestosPorPais, createPedido
} from "../../api/endpoints";

export default function Orders() {
  const [clientes, setClientes] = useState([]);
  const [paises, setPaises] = useState([]);
  const [productos, setProductos] = useState([]);
  const [impuestos, setImpuestos] = useState([]);

  const [clienteSel, setClienteSel] = useState(null);
  const [paisSel, setPaisSel] = useState(null);
  const [items, setItems] = useState([]);

  // Modal producto + cantidad
  const [openModal, setOpenModal] = useState(false);
  const [prodSel, setProdSel] = useState(null);
  const [cantSel, setCantSel] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [c, p, pr] = await Promise.all([
          getClientes(), getPaises(), getProductos()
        ]);
        setClientes(Array.isArray(c) ? c : []);
        setPaises(Array.isArray(p) ? p : []);
        setProductos(Array.isArray(pr) ? pr : []);
      } catch {
        alert("No se pudo cargar datos iniciales");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!paisSel) { setImpuestos([]); return; }
      try {
        const data = await getImpuestosPorPais(paisSel.paisId);
        setImpuestos(Array.isArray(data) ? data : []);
      } catch {
        setImpuestos([]);
      }
    })();
  }, [paisSel]);

  const confirmarAgregar = () => {
    if (!prodSel || cantSel < 1) return;
    if (cantSel > Number(prodSel.stock)) return alert("Cantidad supera el stock");
    if (items.find(i => i.productoId === prodSel.productoId)) {
      return alert("El producto ya fue agregado");
    }
    setItems(prev => [
      ...prev,
      {
        productoId: prodSel.productoId,
        nombre: prodSel.nombre,
        precio: Number(prodSel.precio),
        cantidad: Number(cantSel),
        subtotal: Number(prodSel.precio) * Number(cantSel),
      }
    ]);
    setOpenModal(false);
    setProdSel(null);
    setCantSel(1);
  };

  const updateCantidad = (id, cantidad) => {
    const c = Number(cantidad);
    if (isNaN(c) || c < 1) return;
    setItems(prev => prev.map(i => i.productoId === id ? ({
      ...i, cantidad: c, subtotal: i.precio * c
    }) : i));
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.productoId !== id));

  const subTotal = useMemo(() => items.reduce((acc, i) => acc + i.subtotal, 0), [items]);
  const taxPercent = Number(impuestos?.[0]?.porcentaje || 0);
  const tax = (subTotal * taxPercent) / 100;
  const total = subTotal + tax;

  const savePedido = async () => {
    if (!clienteSel) return alert("Selecciona un cliente");
    if (!paisSel) return alert("Selecciona un país");
    if (!items.length) return alert("Agrega productos");

    const payload = {
      clienteId: clienteSel.clienteId,
      paisId: paisSel.paisId,
      detalles: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
    };
    try {
      await createPedido(payload);
      alert("Pedido creado");
      setItems([]);
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo crear el pedido");
    }
  };

  const columns = [
    { field: "nombre", headerName: "Producto", flex: 1 },
    { field: "precio", headerName: "Precio (S/)", width: 140, valueFormatter: (p)=>`S/ ${Number(p.value).toFixed(2)}` },
    {
      field: "cantidad", headerName: "Cantidad", width: 150,
      renderCell: (params) => (
        <TextField
          type="number" size="small" value={params.row.cantidad}
          onChange={(e)=>updateCantidad(params.row.productoId, e.target.value)}
          inputProps={{ min: 1 }}
        />
      ),
    },
    { field: "subtotal", headerName: "Subtotal", width: 140, valueFormatter: (p)=>`S/ ${Number(p.value).toFixed(2)}` },
    {
      field: "acciones", headerName: "Acciones", width: 130,
      renderCell: (params) => (
        <Button variant="outlined" color="error" size="small" onClick={()=>removeItem(params.row.productoId)}>
          Quitar
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Nuevo Pedido</Typography>

      {/* Datos del pedido */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            options={clientes}
            getOptionLabel={(c) => `${c.ruc} - ${c.nombre}`}
            onChange={(_, value) => {
              setClienteSel(value);
              if (value) {
                const pais = paises.find(p => p.paisId === value.paisId);
                setPaisSel(pais || null);
              } else {
                setPaisSel(null);
              }
            }}
            renderInput={(params) => <TextField {...params} label="Cliente (RUC o nombre)" />}
            sx={{ minWidth: 320, flex: 1 }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>País</InputLabel>
            <Select label="País" value={paisSel?.paisId || ""} disabled>
              {paises.map(p => <MenuItem key={p.paisId} value={p.paisId}>{p.nombre}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Agregar Producto
          </Button>
        </CardContent>
      </Card>

      {/* Detalle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DataGrid
            autoHeight
            rows={items}
            columns={columns}
            getRowId={(r)=>r.productoId}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardContent sx={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Typography>Subtotal: <b>S/ {subTotal.toFixed(2)}</b></Typography>
          <Typography>Impuesto ({taxPercent}%): <b>S/ {tax.toFixed(2)}</b></Typography>
          <Typography variant="h6">Total: S/ {total.toFixed(2)}</Typography>
          <Button variant="contained" color="primary" onClick={savePedido}>Guardar Pedido</Button>
        </CardContent>
      </Card>

      {/* Modal Producto + Cantidad */}
      <Dialog open={openModal} onClose={()=>setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar producto al pedido</DialogTitle>
        <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2, mt:1 }}>
          <Autocomplete
            options={productos}
            value={prodSel}
            onChange={(_, v)=>setProdSel(v)}
            getOptionLabel={(p)=> `${p?.nombre ?? ""} - S/ ${Number(p?.precio ?? 0).toFixed(2)} (Stock: ${p?.stock ?? 0})`}
            renderInput={(params)=> <TextField {...params} label="Producto" />}
          />
          <TextField
            label="Cantidad" type="number" value={cantSel}
            onChange={(e)=>setCantSel(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarAgregar}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
