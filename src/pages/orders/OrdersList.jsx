// src/pages/orders/OrdersList.jsx
import { useEffect, useState } from "react";
import { Box, Card, CardContent, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPedidos } from "../../api/endpoints";
import { getFacturaByPedido, emitirFactura } from "../../api/endpoints";

export default function OrdersList() {
  const [pedidos, setPedidos] = useState([]);

  const loadPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch {
      alert("Error cargando pedidos");
    }
  };

  const handleFacturar = async (pedidoId) => {
    try {
      const existing = await getFacturaByPedido(pedidoId);
      if (existing?.urlPdf) {
        window.open(existing.urlPdf, "_blank"); // abrir PDF si ya existe
        return;
      }
      const factura = await emitirFactura(pedidoId);
      alert("Factura generada");
      window.open(factura.urlPdf, "_blank");
      loadPedidos();
    } catch (e) {
      alert(e?.response?.data?.message || "Error al facturar");
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const columns = [
    { field: "pedidoId", headerName: "ID", width: 80 },
    { field: "clienteId", headerName: "Cliente", width: 120 },
    { field: "paisId", headerName: "País", width: 100 },
    { field: "subtotal", headerName: "Subtotal", width: 120 },
    { field: "descuento", headerName: "Descuento", width: 120 },
    { field: "impuesto", headerName: "Impuesto", width: 120 },
    { field: "total", headerName: "Total Final", width: 140 },
    { field: "estado", headerName: "Estado", width: 120 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 180,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleFacturar(params.row.pedidoId)}
        >
          Facturar / Ver PDF
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Pedidos</Typography>
      <Card>
        <CardContent>
          <DataGrid
            autoHeight
            rows={pedidos}
            columns={columns}
            getRowId={(r) => r.pedidoId}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
