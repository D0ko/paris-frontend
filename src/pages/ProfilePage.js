import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Avatar,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  TrendingUp,
  SportsSoccer,
  EmojiEvents,
  Timeline,
  Star,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authService, betsService, rankingService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Récupérer le profil détaillé
      const profileData = await authService.getProfile(token);
      setProfile(profileData);
      
      // Récupérer tous les paris pour filtrer ceux de l'utilisateur
      const allBets = await betsService.getBets();
      const myBets = allBets.filter(bet => bet.creator === user?.login);
      setUserBets(myBets);
      
      // Récupérer le classement pour trouver la position de l'utilisateur
      const ranking = await rankingService.getRanking();
      const userPosition = ranking.users.findIndex(u => u.login === user?.login) + 1;
      setUserRank(userPosition > 0 ? userPosition : null);
      
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getWinRate = () => {
    if (!profile || profile.total_bets === 0) return 0;
    return Math.round((profile.won_bets / profile.total_bets) * 100);
  };

  const getPerformanceLevel = () => {
    const winRate = getWinRate();
    if (winRate >= 70) return { level: 'Expert', color: 'success', icon: '🏆' };
    if (winRate >= 50) return { level: 'Bon', color: 'primary', icon: '⭐' };
    if (winRate >= 30) return { level: 'Moyen', color: 'warning', icon: '📈' };
    return { level: 'Débutant', color: 'error', icon: '🎯' };
  };

  const getBadges = () => {
    const badges = [];
    
    if (profile.total_bets >= 10) {
      badges.push({ name: 'Parieur actif', icon: '🎯', description: '10+ paris joués' });
    }
    
    if (profile.won_bets >= 5) {
      badges.push({ name: 'Gagnant', icon: '🏅', description: '5+ paris gagnés' });
    }
    
    if (getWinRate() >= 70) {
      badges.push({ name: 'Expert', icon: '🏆', description: 'Taux de réussite ≥ 70%' });
    }
    
    if (userBets.length >= 3) {
      badges.push({ name: 'Créateur', icon: '✨', description: '3+ paris créés' });
    }
    
    if (profile.points >= 50) {
      badges.push({ name: 'Champion', icon: '👑', description: '50+ points' });
    }
    
    if (userRank && userRank <= 3) {
      badges.push({ name: 'Podium', icon: '🥇', description: 'Top 3 du classement' });
    }
    
    return badges;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        Impossible de charger le profil
      </Alert>
    );
  }

  const performance = getPerformanceLevel();
  const badges = getBadges();

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Mon Profil
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={() => setLogoutDialogOpen(true)}
        >
          Se déconnecter
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Informations principales */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {profile.login.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profile.login}
              </Typography>
              
              <Chip
                icon={<Star />}
                label={`${performance.icon} ${performance.level}`}
                color={performance.color}
                size="large"
                sx={{ mb: 2 }}
              />
              
              {userRank && (
                <Typography variant="h6" color="primary">
                  #{userRank} au classement général
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Mes statistiques
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {profile.points}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="info.main">
                      {profile.total_bets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paris joués
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="success.main">
                      {profile.won_bets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paris gagnés
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="error.main">
                      {profile.lost_bets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paris perdus
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={4}>
                <Typography variant="body1" gutterBottom>
                  Taux de réussite : {getWinRate()}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getWinRate()}
                  sx={{ height: 10, borderRadius: 5 }}
                  color={performance.color}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Badges et achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏅 Badges obtenus ({badges.length})
              </Typography>
              
              {badges.length > 0 ? (
                <Grid container spacing={2}>
                  {badges.map((badge, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" gutterBottom>
                            {badge.icon}
                          </Typography>
                          <Typography variant="subtitle1" gutterBottom>
                            {badge.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {badge.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography variant="body1" color="text.secondary">
                    Pas encore de badges obtenus
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participez à plus de paris pour débloquer des badges !
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions rapides */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Actions rapides
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SportsSoccer />}
                    onClick={() => navigate('/create-bet')}
                  >
                    Créer un nouveau pari
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Timeline />}
                    onClick={() => navigate('/bets')}
                  >
                    Voir tous les paris
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EmojiEvents />}
                    onClick={() => navigate('/ranking')}
                  >
                    Consulter le classement
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Paris créés */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Mes paris créés ({userBets.length})
              </Typography>
              
              {userBets.length > 0 ? (
                <Grid container spacing={2}>
                  {userBets.slice(0, 6).map((bet) => (
                    <Grid item xs={12} sm={6} md={4} key={bet.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" noWrap>
                              {bet.title.length > 20 ? bet.title.slice(0, 20) + '...' : bet.title}
                            </Typography>
                            <Chip
                              label={bet.status === 'active' ? 'En cours' : 'Terminé'}
                              size="small"
                              color={bet.status === 'active' ? 'success' : 'default'}
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {bet.description.length > 50 ? bet.description.slice(0, 50) + '...' : bet.description}
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            <Chip label={bet.league} size="small" variant="outlined" />
                            <Typography variant="caption" color="text.secondary">
                              {bet.total_votes} votes
                            </Typography>
                          </Box>
                          
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/bet/${bet.id}`)}
                          >
                            Voir détails
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Vous n'avez pas encore créé de pari
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/create-bet')}
                    sx={{ mt: 2 }}
                  >
                    Créer mon premier pari
                  </Button>
                </Box>
              )}
              
              {userBets.length > 6 && (
                <Box textAlign="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/bets')}
                  >
                    Voir tous mes paris
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de déconnexion */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirmer la déconnexion</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir vous déconnecter ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Se déconnecter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;