import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    if (token) {
      // Vérifier la validité du token en récupérant le profil
      authService.getProfile(token)
        .then(profile => {
          setUser(profile);
        })
        .catch(() => {
          // Token invalide, on le supprime
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  const login = async (loginData) => {
    setLoading(true);
    try {
      const response = await authService.login(loginData);
      const newToken = response.token;
      
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      // Récupérer le profil de l'utilisateur
      const profile = await authService.getProfile(newToken);
      setUser(profile);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      await authService.register(registerData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur lors de l\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};