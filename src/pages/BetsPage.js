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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { betsService } from '../services/api';

const BetsPage = () => {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const data = await betsService.getBets();
        setBets(data);
        setFilteredBets(data);
      } catch (err) {
        setError('Erreur lors du chargement des paris');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  useEffect(() => {
    let filtered = bets;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(bet =>
        bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bet => bet.status === statusFilter);
    }

    // Filtrer par ligue
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(bet => bet.league === leagueFilter);
    }

    setFilteredBets(filtered);
  }, [bets, searchTerm, statusFilter, leagueFilter]);

  const getUniqueLeagues = () => {
    const leagues = [...new Set(bets.map(bet => bet.league))];
    return leagues;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Tous les paris
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-bet')}
        >
          Créer un pari
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList /> Filtres
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="active">En cours</MenuItem>
                  <MenuItem value="resolved">Terminés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ligue</InputLabel>
                <Select
                  value={leagueFilter}
                  label="Ligue"
                  onChange={(e) => setLeagueFilter(e.target.value)}
                >
                  <MenuItem value="all">Toutes</MenuItem>
                  {getUniqueLeagues().map((league) => (
                    <MenuItem key={league} value={league}>
                      {league}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des paris */}
      {filteredBets.length > 0 ? (
        <Grid container spacing={3}>
          {filteredBets.map((bet) => (
            <Grid item xs={12} md={6} lg={4} key={bet.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {bet.title}
                    </Typography>
                    <Chip 
                      label={bet.status === 'active' ? 'En cours' : 'Terminé'}
                      size="small"
                      color={bet.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {bet.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
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
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Créé par {bet.creator}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatDate(bet.created_at)}
                  </Typography>
                </CardContent>

                <Box p={2} pt={0}>
                  <Button
                    fullWidth
                    variant={bet.status === 'active' ? 'contained' : 'outlined'}
                    onClick={() => navigate(`/bet/${bet.id}`)}
                  >
                    {bet.status === 'active' ? 'Participer' : 'Voir les résultats'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {bets.length === 0 ? 'Aucun pari disponible' : 'Aucun pari ne correspond à vos critères'}
            </Typography>
            {bets.length === 0 && (
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/create-bet')}
              >
                Créer le premier pari
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Statistiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {bets.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paris total
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {bets.filter(bet => bet.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En cours
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="text.secondary">
                    {bets.filter(bet => bet.status === 'resolved').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terminés
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {getUniqueLeagues().length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ligues
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BetsPage;