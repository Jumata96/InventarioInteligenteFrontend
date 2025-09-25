import api from "./client";

// ===== AUTH =====
export async function loginApi(payload) {
  const { data } = await api.post("/api/Auth/login", payload);
  return data; // { token, ... }
}
export async function registerApi(payload) {
  const { data } = await api.post("/api/Auth/register", payload);
  return data;
}

// ===== PRODUCTOS =====
export async function getProductos() {
  const { data } = await api.get("/api/Productos");
  return data;
}
export async function getProductosPaged(page, pageSize, query = "") {
  const { data } = await api.get("/api/Productos/paged", {
    params: { 
      page: page,   
      pageSize,
      q: query || undefined, // solo enviar si hay filtro
    },
  });
  return data; // { data: [...], totalCount: N }
}
export async function createProducto(payload) {
  const { data } = await api.post("/api/Productos", payload);
  return data;
}
export async function updateProducto(id, payload) {
  const { data } = await api.put(`/api/Productos/${id}`, payload);
  return data;
}
export async function deleteProducto(id) {
  const { data } = await api.delete(`/api/Productos/${id}`);
  return data;
}
 export const enableProducto = async (id) => {
  await api.patch(`/api/Productos/${id}/enable`);
};

export const disableProducto = async (id) => {
  await api.patch(`/api/Productos/${id}/disable`);
};

 
// ===== CLIENTES =====
export async function getClientes() {
  const { data } = await api.get("/api/Clientes");
  return data;
}
export async function createCliente(payload) {
  const { data } = await api.post("/api/Clientes", payload);
  return data;
}
export async function updateCliente(id, payload) {
  const { data } = await api.put(`/api/Clientes/${id}`, payload);
  return data;
}
export async function deleteCliente(id) {
  const { data } = await api.delete(`/api/Clientes/${id}`);
  return data;
}

export async function enableCliente(id) {
  const { data } = await api.patch(`/api/Clientes/${id}/enable`);
  return data;
}

export async function disableCliente(id) {
  const { data } = await api.patch(`/api/Clientes/${id}/disable`);
  return data;
}
export async function getClientesPaged(page, pageSize, query = "") {
  const { data } = await api.get("/api/Clientes/paged", {
    params: {
      page: page  ,   
      pageSize,
      q: query
    },
  });
  return data; // { items: [...], totalCount: N }
}


// ===== PAISES / IMPUESTOS =====
export async function getPaises() {
  const { data } = await api.get("/api/Paises");
  return data;
}
export async function getImpuestosPorPais(paisId) {
  const { data } = await api.get(`/api/Impuestos/pais/${paisId}`);
  return data;
}

// ===== PEDIDOS =====
export async function getPedidos() {
  const { data } = await api.get("/api/Pedidos");
  return data;
}
export async function createPedido(payload) {
  const { data } = await api.post("/api/Pedidos", payload);
  return data;
}
export async function getPedidosPaged(page, pageSize, query = "") {
  const { data } = await api.get("/api/Pedidos/paged", {
    params: {
      page: page,
      pageSize,
      q: query || undefined,  
    },
  });
  return data;
}

export async function getPedidoById(id) {
  const { data } = await api.get(`/api/Pedidos/${id}`);
  return data;
}
export async function deletePedido(id) {
  const { data } = await api.delete(`/api/Pedidos/${id}`);
  return data;
}
export async function calcularDescuento(payload) {
  const { data } = await api.post("/api/Pedidos/calcular-descuento", payload);
  return data; // { subtotal, descuento, total }
}

// ===== FACTURAS =====
export async function getFacturas() {
  const { data } = await api.get("/api/Facturas");
  return data; // [ { facturaId, pedidoId, numeroFactura, subtotal, descuento, impuesto, total, estado, urlPdf } ]
}

export async function getFacturaByPedido(pedidoId) {
  const { data } = await api.get(`/api/Facturas/pedido/${pedidoId}`);
  return data; // { facturaId, pedidoId, numeroFactura, subtotal, ... , urlPdf }
}

export async function emitirFactura(pedidoId) {
  const { data } = await api.post(`/api/Facturas/emitir/${pedidoId}`);
  return data; // { facturaId, pedidoId, numeroFactura, subtotal, ... , urlPdf }
}
