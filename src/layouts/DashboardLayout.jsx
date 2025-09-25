import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const menuItems = [
    { text: "Productos", icon: <InventoryIcon />, path: "/products" },
    { text: "Clientes", icon: <PeopleIcon />, path: "/clients" },
    { text: "Pedidos", icon: <ShoppingCartIcon />, path: "/orders" },
    { text: "Salir", icon: <LogoutIcon />, action: () => { logout(); nav("/login"); } },
  ];

  const drawer = (
    <div>
      <Toolbar><Typography variant="h6">Inventario</Typography></Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => item.action ? item.action() : nav(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap> Sistema de Inventarios </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
