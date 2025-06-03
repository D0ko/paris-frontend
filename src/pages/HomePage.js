import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  SportsSoccer,
  Add,
  Leaderboard,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { betsService, rankingService } from '../services/api';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBets, setRecentBets] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les paris récents
        const betsData = await betsService.getBets();
        setRecentBets(betsData.slice(0, 3)); // 3 paris les plus récents
        
        // Récupérer le top 3 du classement
        const rankingData = await rankingService.getRanking();
        setRanking(rankingData.users.slice(0, 3));
        
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Créer un pari',
      description: 'Proposez un nouveau pari à la communauté',
      icon: <Add fontSize="large" />,
      path: '/create-bet',
      color: 'primary',
    },
    {
      title: 'Voir tous les paris',
      description: 'Participez aux paris en cours',
      icon: <SportsSoccer fontSize="large" />,
      path: '/bets',
      color: 'secondary',
    },
    {
      title: 'Classement',
      description: 'Découvrez le top des parieurs',
      icon: <Leaderboard fontSize="large" />,
      path: '/ranking',
      color: 'success',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête de bienvenue */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bienvenue, {user?.login} ! 🎯
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Votre score actuel : {user?.points || 0} points
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Actions rapides */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Actions rapides
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  }
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box color={`${action.color}.main`} mb={2}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {/* Paris récents */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Paris récents
          </Typography>
          {recentBets.length > 0 ? (
            <Grid container spacing={2}>
              {recentBets.map((bet) => (
                <Grid item xs={12} key={bet.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {bet.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {bet.description}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center" mb={1}>
                            <Chip 
                              label={bet.league} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${bet.total_votes} votes`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={bet.status === 'active' ? 'En cours' : 'Terminé'} 
                              size="small" 
                              color={bet.status === 'active' ? 'success' : 'default'}
                            />
                          </Box>
                        </Box>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/bet/${bet.id}`)}
                        >
                          Voir
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Aucun pari récent
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/create-bet')}
                >
                  Créer le premier pari
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Top classement */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Top 3 <TrendingUp />
          </Typography>
          <Card>
            <CardContent>
              {ranking.length > 0 ? (
                ranking.map((user, index) => (
                  <Box 
                    key={user.login}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    py={1}
                    borderBottom={index < ranking.length - 1 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="h6" 
                        color={index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32'}
                      >
                        #{index + 1}
                      </Typography>
                      <Typography variant="body1">
                        {user.login}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body1" fontWeight="bold">
                        {user.points} pts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.total_bets} paris
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Aucun classement disponible
                </Typography>
              )}
              <Button 
                fullWidth 
                variant="text" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/ranking')}
              >
                Voir le classement complet
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;