import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { rankingService } from '../services/api';

const RankingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('global');

  useEffect(() => {
    fetchRanking();
  }, [selectedLeague]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const league = selectedLeague === 'global' ? null : selectedLeague;
      const data = await rankingService.getRanking(league);
      setRanking(data.users);
    } catch (err) {
      setError('Erreur lors du chargement du classement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrophyIcon = (position) => {
    switch (position) {
      case 1:
        return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 2:
        return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
      case 3:
        return <EmojiEvents sx={{ color: '#CD7F32' }} />;
      default:
        return null;
    }
  };

  const getTrendIcon = (points) => {
    if (points > 0) return <TrendingUp color="success" />;
    if (points < 0) return <TrendingDown color="error" />;
    return <Remove color="disabled" />;
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return theme.palette.primary.main;
    }
  };

  const getUserRank = () => {
    const userRank = ranking.findIndex(u => u.login === user?.login) + 1;
    return userRank > 0 ? userRank : null;
  };

  const availableLeagues = ['global', 'football', 'tennis', 'basketball', 'politique', 'entertainment', 'esport'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏆 Classement
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Système de points : +10 pour un bon pari, -5 pour un mauvais pari
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtre par ligue */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Ligue</InputLabel>
            <Select
              value={selectedLeague}
              label="Ligue"
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              {availableLeagues.map((league) => (
                <MenuItem key={league} value={league}>
                  {league === 'global' ? 'Classement global' : league.charAt(0).toUpperCase() + league.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Statistiques utilisateur */}
      {getUserRank() && (
        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Votre position
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4">
                #{getUserRank()}
              </Typography>
              <Box>
                <Typography variant="body1">
                  {user?.points || 0} points
                </Typography>
                <Typography variant="body2">
                  {user?.total_bets || 0} paris • {user?.won_bets || 0} gagnés
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Podium (Top 3) */}
      {ranking.length > 0 && !isMobile && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom textAlign="center">
              🥇 Podium
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="end" gap={4} py={4}>
              {/* 2ème place */}
              {ranking[1] && (
                <Box textAlign="center">
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: '#C0C0C0',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {ranking[1].login.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">{ranking[1].login}</Typography>
                  <Typography variant="h5" color="text.secondary">{ranking[1].points} pts</Typography>
                  <Chip label="2ème" size="small" sx={{ bgcolor: '#C0C0C0', color: 'white' }} />
                </Box>
              )}

              {/* 1ère place */}
              {ranking[0] && (
                <Box textAlign="center">
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#FFD700',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {ranking[0].login.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5">{ranking[0].login}</Typography>
                  <Typography variant="h4" color="primary">{ranking[0].points} pts</Typography>
                  <Chip label="1er" size="small" sx={{ bgcolor: '#FFD700', color: 'white' }} />
                </Box>
              )}

              {/* 3ème place */}
              {ranking[2] && (
                <Box textAlign="center">
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: '#CD7F32',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {ranking[2].login.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">{ranking[2].login}</Typography>
                  <Typography variant="h6" color="text.secondary">{ranking[2].points} pts</Typography>
                  <Chip label="3ème" size="small" sx={{ bgcolor: '#CD7F32', color: 'white' }} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tableau complet */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Utilisateur</strong></TableCell>
                <TableCell align="center"><strong>Points</strong></TableCell>
                <TableCell align="center"><strong>Paris</strong></TableCell>
                <TableCell align="center"><strong>Gagnés</strong></TableCell>
                <TableCell align="center"><strong>Taux</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.length > 0 ? (
                ranking.map((userRank, index) => {
                  const position = index + 1;
                  const isCurrentUser = userRank.login === user?.login;
                  
                  return (
                    <TableRow 
                      key={userRank.login}
                      sx={{ 
                        bgcolor: isCurrentUser ? 'primary.light' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: getPositionColor(position),
                              fontWeight: 'bold'
                            }}
                          >
                            #{position}
                          </Typography>
                          {getTrophyIcon(position)}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {userRank.login.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={isCurrentUser ? 'bold' : 'normal'}>
                              {userRank.login}
                              {isCurrentUser && ' (Vous)'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <Typography 
                            variant="h6" 
                            color={userRank.points > 0 ? 'success.main' : userRank.points < 0 ? 'error.main' : 'text.secondary'}
                            fontWeight="bold"
                          >
                            {userRank.points}
                          </Typography>
                          {getTrendIcon(userRank.points)}
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body1">
                          {userRank.total_bets}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body1" color="success.main">
                          {userRank.won_bets}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          label={`${Math.round(userRank.win_rate * 100)}%`}
                          size="small"
                          color={userRank.win_rate > 0.6 ? 'success' : userRank.win_rate > 0.4 ? 'warning' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="h6" color="text.secondary" py={4}>
                      Aucun utilisateur dans le classement
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Statistiques générales */}
      {ranking.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Statistiques générales
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {ranking.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {Math.max(...ranking.map(u => u.points))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meilleur score
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {Math.round(ranking.reduce((sum, u) => sum + u.win_rate, 0) / ranking.length * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taux moyen
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RankingPage;