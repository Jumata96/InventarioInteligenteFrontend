// src/utils/status.js
import { CheckCircle, Block, Delete } from "@mui/icons-material";

export const ESTADOS = {
  ACTIVO: 1,
  DESHABILITADO: 2,
  ELIMINADO: 0,
};

export const getEstadoLabel = (estado) => {
  switch (estado) {
    case ESTADOS.ACTIVO:
      return "Activo";
    case ESTADOS.DESHABILITADO:
      return "Deshabilitado";
    case ESTADOS.ELIMINADO:
      return "Eliminado";
    default:
      return "Desconocido";
  }
};

export const getEstadoIcon = (estado) => {
  switch (estado) {
    case ESTADOS.ACTIVO:
      return <CheckCircle color="success" fontSize="small" />;
    case ESTADOS.DESHABILITADO:
      return <Block color="warning" fontSize="small" />;
    case ESTADOS.ELIMINADO:
      return <Delete color="error" fontSize="small" />;
    default:
      return null;
  }
};
