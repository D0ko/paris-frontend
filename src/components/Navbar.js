import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  Home,
  SportsSoccer,
  Leaderboard,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Accueil', icon: <Home />, path: '/' },
    { label: 'Paris', icon: <SportsSoccer />, path: '/bets' },
    { label: 'Créer un pari', icon: <Add />, path: '/create-bet' },
    { label: 'Classement', icon: <Leaderboard />, path: '/ranking' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer', mr: 4 }}
          onClick={() => navigate('/')}
        >
          Paris App
        </Typography>

        {isAuthenticated && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Bonjour, {user?.login}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.login?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                Mon Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Déconnexion
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Connexion
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Inscription
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;