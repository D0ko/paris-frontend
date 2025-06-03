import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import BetsPage from './pages/BetsPage';
import CreateBetPage from './pages/CreateBetPage';
import BetDetailPage from './pages/BetDetailPage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} 
          />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/bets" element={
            <ProtectedRoute>
              <BetsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/create-bet" element={
            <ProtectedRoute>
              <CreateBetPage />
            </ProtectedRoute>
          } />
          
          <Route path="/bet/:betId" element={
            <ProtectedRoute>
              <BetDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/ranking" element={
            <ProtectedRoute>
              <RankingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;