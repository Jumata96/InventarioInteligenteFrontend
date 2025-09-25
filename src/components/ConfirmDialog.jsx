import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ConfirmDialog({ 
  open,          // boolean → si está abierto
  title,         // string → título
  message,       // string → mensaje
  onClose,       // función → cerrar sin confirmar
  onConfirm,     // función → acción al confirmar
  confirmText = "Aceptar",   // texto botón confirmar
  cancelText = "Cancelar"    // texto botón cancelar
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      {title && <DialogTitle>{title}</DialogTitle>}
      {message && (
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
