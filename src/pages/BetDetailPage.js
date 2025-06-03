import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Schedule,
  HowToVote,
  CheckCircle,
  Gavel,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { betsService } from '../services/api';

const BetDetailPage = () => {
  const { betId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [winningOption, setWinningOption] = useState('');

  useEffect(() => {
    fetchBetDetails();
  }, [betId]);

  const fetchBetDetails = async () => {
    try {
      setLoading(true);
      const data = await betsService.getBetDetails(betId);
      setBet(data);
    } catch (err) {
      setError('Erreur lors du chargement du pari');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Veuillez sélectionner une option');
      return;
    }

    try {
      setVoting(true);
      setError('');
      
      await betsService.voteBet(betId, { option_index: parseInt(selectedOption) }, token);
      
      setSuccess('Vote enregistré avec succès !');
      
      // Recharger les détails du pari
      await fetchBetDetails();
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du vote');
    } finally {
      setVoting(false);
    }
  };

  const handleResolve = async () => {
    try {
      setResolving(true);
      setError('');
      
      await betsService.resolveBet(
        betId, 
        { winning_option_index: parseInt(winningOption) }, 
        token
      );
      
      setSuccess('Pari résolu avec succès !');
      setResolveDialogOpen(false);
      
      // Recharger les détails du pari
      await fetchBetDetails();
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la résolution');
    } finally {
      setResolving(false);
    }
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

  const getTotalVotes = () => {
    return Object.values(bet?.vote_counts || {}).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (optionIndex) => {
    const totalVotes = getTotalVotes();
    const optionVotes = bet?.vote_counts?.[optionIndex] || 0;
    return totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
  };

  const hasUserVoted = () => {
    return bet?.votes?.some(vote => vote.user === user?.login);
  };

  const getUserVote = () => {
    return bet?.votes?.find(vote => vote.user === user?.login);
  };

  const isCreator = () => {
    return bet?.creator === user?.login;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!bet) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error">
          Pari non trouvé
        </Typography>
        <Button onClick={() => navigate('/bets')} sx={{ mt: 2 }}>
          Retour aux paris
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/bets')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" flexGrow={1}>
          Détails du pari
        </Typography>
        <Chip
          label={bet.status === 'active' ? 'En cours' : 'Terminé'}
          color={bet.status === 'active' ? 'success' : 'default'}
          icon={bet.status === 'active' ? <HowToVote /> : <CheckCircle />}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Informations du pari */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {bet.title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {bet.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Chip
            icon={<Person />}
            label={`Créé par ${bet.creator}`}
            variant="outlined"
          />
          <Chip
            icon={<Schedule />}
            label={formatDate(bet.created_at)}
            variant="outlined"
          />
          <Chip
            label={bet.league}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${getTotalVotes()} votes`}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Résultat si résolu */}
        {bet.status === 'resolved' && bet.resolved_option !== null && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6">
              🏆 Résultat : {bet.options[bet.resolved_option]}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Options et votes */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Options de vote
        </Typography>

        {bet.status === 'active' && !hasUserVoted() && (
          <Box mb={4}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Choisissez votre option :</FormLabel>
              <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {bet.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option}
                    sx={{ my: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleVote}
              disabled={voting || !selectedOption}
              sx={{ mt: 2 }}
            >
              {voting ? <CircularProgress size={24} /> : 'Voter'}
            </Button>
          </Box>
        )}

        {/* Affichage des résultats */}
        <Box>
          {bet.options.map((option, index) => {
            const voteCount = bet.vote_counts?.[index] || 0;
            const percentage = getVotePercentage(index);
            const isUserChoice = getUserVote()?.option_index === index;
            const isWinningOption = bet.resolved_option === index;

            return (
              <Card 
                key={index} 
                sx={{ 
                  mb: 2,
                  bgcolor: isWinningOption ? 'success.light' : 
                           isUserChoice ? 'primary.light' : 'background.paper',
                  border: isUserChoice ? 2 : 1,
                  borderColor: isWinningOption ? 'success.main' :
                              isUserChoice ? 'primary.main' : 'divider'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">
                      {option}
                      {isWinningOption && ' 🏆'}
                      {isUserChoice && ' (Votre choix)'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {percentage}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                    color={isWinningOption ? 'success' : 'primary'}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    {voteCount} vote{voteCount !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Message si déjà voté */}
        {bet.status === 'active' && hasUserVoted() && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Vous avez déjà voté pour : <strong>{bet.options[getUserVote().option_index]}</strong>
          </Alert>
        )}
      </Paper>

      {/* Actions du créateur */}
      {isCreator() && bet.status === 'active' && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Actions du créateur
          </Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Gavel />}
            onClick={() => setResolveDialogOpen(true)}
          >
            Résoudre le pari
          </Button>
        </Paper>
      )}

      {/* Dialog de résolution */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)}>
        <DialogTitle>Résoudre le pari</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Sélectionnez l'option gagnante pour ce pari :
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Option gagnante</InputLabel>
            <Select
              value={winningOption}
              label="Option gagnante"
              onChange={(e) => setWinningOption(e.target.value)}
            >
              {bet.options.map((option, index) => (
                <MenuItem key={index} value={index}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleResolve}
            variant="contained"
            disabled={resolving || winningOption === ''}
          >
            {resolving ? <CircularProgress size={24} /> : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BetDetailPage;