// src/pages/orders/Orders.jsx
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Autocomplete, MenuItem, Select, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import {
  getClientesPaged, getPaises, getProductosPaged, getImpuestosPorPais,
  createPedido, calcularDescuento
} from "../../api/endpoints";

export default function Orders() {
  const [clientesOpts, setClientesOpts] = useState([]);
  const [productosOpts, setProductosOpts] = useState([]);
  const [paises, setPaises] = useState([]);
  const [impuestos, setImpuestos] = useState([]);

  const [clienteSel, setClienteSel] = useState(null);
  const [paisSel, setPaisSel] = useState(null);
  const [items, setItems] = useState([]);

  // búsqueda con debounce
  const [searchCliente, setSearchCliente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");

  // Modal producto + cantidad
  const [openModal, setOpenModal] = useState(false);
  const [prodSel, setProdSel] = useState(null);
  const [cantSel, setCantSel] = useState(1);

  // Totales calculados desde backend
  const [totales, setTotales] = useState({ subtotal: 0, descuento: 0, total: 0 });

  const formatPrice = (value) => {
    const raw = Number(value ?? 0);
    if (isNaN(raw)) return "S/ 0.00";
    return raw.toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // cargar paises
  useEffect(() => {
    (async () => {
      try {
        const p = await getPaises();
        setPaises(Array.isArray(p) ? p : []);
      } catch {
        alert("No se pudo cargar países");
      }
    })();
  }, []);

  // cargar clientes dinámicos
  useEffect(() => {
    (async () => {
      try {
        const clientesData = await getClientesPaged(0, 10, searchCliente);
        setClientesOpts(clientesData.items ?? []);
      } catch {
        setClientesOpts([]);
      }
    })();
  }, [searchCliente]);

  // cargar productos dinámicos
  useEffect(() => {
    (async () => {
      try {
        const productosData = await getProductosPaged(0, 10, searchProducto);
        setProductosOpts(productosData.items ?? []);
      } catch {
        setProductosOpts([]);
      }
    })();
  }, [searchProducto]);

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

  // Calcular descuento dinámicamente con backend
  useEffect(() => {
    const calcular = async () => {
      if (!items.length) {
        setTotales({ subtotal: 0, descuento: 0, total: 0 });
        return;
      }
      try {
        const payload = {
          clienteId: clienteSel?.clienteId || 0,
          paisId: paisSel?.paisId || 0,
          detalles: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
        };
        const result = await calcularDescuento(payload);
        setTotales(result); // { subtotal, descuento, total }
      } catch (err) {
        console.error("Error calculando descuento", err);
        setTotales({ subtotal: 0, descuento: 0, total: 0 });
      }
    };
    calcular();
  }, [items, clienteSel, paisSel]);

  const confirmarAgregar = () => {
    if (!prodSel || cantSel < 1) return;
    setItems(prev => {
      const existe = prev.find(i => i.productoId === prodSel.productoId);
      if (existe) {
        if (existe.cantidad + cantSel > Number(prodSel.stock)) {
          alert("Cantidad supera el stock disponible");
          return prev;
        }
        return prev.map(i =>
          i.productoId === prodSel.productoId
            ? {
                ...i,
                cantidad: i.cantidad + Number(cantSel),
                subtotal: i.precio * (i.cantidad + Number(cantSel))
              }
            : i
        );
      } else {
        if (cantSel > Number(prodSel.stock)) {
          alert("Cantidad supera el stock disponible");
          return prev;
        }
        return [
          ...prev,
          {
            productoId: prodSel.productoId,
            nombre: prodSel.nombre,
            precio: Number(prodSel.precio),
            cantidad: Number(cantSel),
            subtotal: Number(prodSel.precio) * Number(cantSel),
          },
        ];
      }
    });
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

  // Impuestos (se aplican sobre total del backend)
  const taxPercent = Number(impuestos?.[0]?.porcentaje || 0);
  const tax = ((totales.total) * taxPercent) / 100;
  const totalFinal = totales.total + tax;

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
      setTotales({ subtotal: 0, descuento: 0, total: 0 });
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo crear el pedido");
    }
  };

  const columns = [
    { field: "nombre", headerName: "Producto", flex: 1, minWidth: 160 },
    {
      field: "precio",
      headerName: "Precio (S/)",
      width: 140,
      valueFormatter: (p) => formatPrice(p),
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      width: 150,
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          value={params.row.cantidad}
          onChange={(e) => updateCantidad(params.row.productoId, e.target.value)}
          inputProps={{ min: 1 }}
        />
      ),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      width: 140,
      valueFormatter: (p) => formatPrice(p),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => removeItem(params.row.productoId)}
        >
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
            options={clientesOpts}
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
            onInputChange={(_, value) => setSearchCliente(value)}
            renderInput={(params) => <TextField {...params} label="Cliente (RUC o nombre)" />}
            sx={{ minWidth: 320, flex: 1 }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>País</InputLabel>
            <Select
              label="País"
              value={paisSel?.paisId || ""}
              onChange={(e) => {
                const pais = paises.find(p => p.paisId === e.target.value);
                setPaisSel(pais || null);
              }}
            >
              {paises.map(p => (
                <MenuItem key={p.paisId} value={p.paisId}>
                  {p.nombre}
                </MenuItem>
              ))}
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
            getRowId={(r) => r.productoId}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardContent sx={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Typography>Subtotal: <b>{formatPrice(totales.subtotal)}</b></Typography>
          <Typography>Descuento: <b>-{formatPrice(totales.descuento)}</b></Typography>
          <Typography>Impuesto ({taxPercent}%): <b>{formatPrice(tax)}</b></Typography>
          <Typography variant="h6">Total a Pagar: {formatPrice(totalFinal)}</Typography>
          <Button variant="contained" color="primary" onClick={savePedido}>
            Guardar Pedido
          </Button>
        </CardContent>
      </Card>

      {/* Modal Producto + Cantidad */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar producto al pedido</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Autocomplete
            options={productosOpts}
            value={prodSel}
            onChange={(_, v) => setProdSel(v)}
            onInputChange={(_, value) => setSearchProducto(value)}
            getOptionLabel={(p) =>
              `${p?.nombre ?? ""} - ${formatPrice(p?.precio)} (Stock: ${p?.stock ?? 0})`
            }
            renderInput={(params) => <TextField {...params} label="Producto" />}
          />
          <TextField
            label="Cantidad"
            type="number"
            value={cantSel}
            onChange={(e) => setCantSel(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarAgregar}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
