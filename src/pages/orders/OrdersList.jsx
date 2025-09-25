import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPedidosPaged, getFacturaByPedido, emitirFactura } from "../../api/endpoints";

export default function OrdersList() {
  const [pedidos, setPedidos] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // 🔍 filtro
  const [search, setSearch] = useState(""); // estado para el input

  // Cargar pedidos
  const loadPedidos = async () => {
    try {
      setLoading(true);
      const { data, totalCount } = await getPedidosPaged(page + 1, pageSize, query);
      setPedidos(data);
      setRowCount(totalCount);
    } catch {
      alert("Error cargando pedidos");
    } finally {
      setLoading(false);
    }
  };

  // Generar o ver factura
  const handleFacturar = async (pedidoId) => {
    console.log("Facturando pedido:", pedidoId);
    try {
      const existing = await getFacturaByPedido(pedidoId);
      if (existing?.urlPdf) {
        console.log("Factura ya existe:", existing);
        window.open(`${import.meta.env.VITE_API_URL}${existing.urlPdf}`, "_blank");
        //descargarArchivo(existing.urlPdf);
        return;
      }
      const factura = await emitirFactura(pedidoId);
      alert("Factura generada con éxito");
      console.log(factura);
      // window.open(factura.urlPdf, "_blank");
      window.open(`${import.meta.env.VITE_API_URL}${factura.urlPdf}`, "_blank");
      //descargarArchivo(factura.urlPdf);
      loadPedidos(); // actualizar tabla
    } catch (e) {
      alert(e?.response?.data?.message || "Error al facturar");
    }
  };
  //recargar al cambiar paginación o filtro
  useEffect(() => {
    loadPedidos();
  }, [page, pageSize, query]);

  // Definición de columnas
  const columns = [
    { field: "pedidoId", headerName: "ID", width: 80 },
    { field: "clienteNombre", headerName: "Cliente", width: 150 },
    { field: "paisNombre", headerName: "País", width: 120 },
    { field: "subtotal", headerName: "Subtotal", width: 120 },
    { field: "descuento", headerName: "Descuento", width: 120 },
    { field: "impuesto", headerName: "Impuesto", width: 120 },
    { field: "totalFinal", headerName: "Total Final", width: 140 },
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
      <Typography variant="h5" gutterBottom>
        Pedidos
      </Typography>

      {/* 🔍 Barra de acciones */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setQuery(search); // aplicar filtro con Enter
          }}
        />
        <Button variant="outlined" onClick={() => setQuery(search)}>
          Filtrar
        </Button>
        <Button variant="outlined" onClick={() => { setSearch(""); setQuery(""); }}>
          Limpiar
        </Button>
        <Button variant="contained" onClick={loadPedidos}>
          Actualizar
        </Button>
      </Stack>

      {/* 📋 Tabla */}
      <Card>
        <CardContent>
          <DataGrid
            autoHeight
            rows={pedidos}
            columns={columns}
            getRowId={(r) => r.pedidoId}
            pageSizeOptions={[5, 10, 20]}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
