import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { betsService } from '../services/api';

const CreateBetPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    league: 'general',
    options: ['', ''],
  });

  const predefinedLeagues = [
    'general',
    'football',
    'tennis',
    'basketball',
    'politique',
    'entertainment',
    'esport',
    'autre'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      setError('Il faut au moins 2 options valides');
      return;
    }

    // Vérifier les doublons
    const uniqueOptions = [...new Set(validOptions.map(opt => opt.trim().toLowerCase()))];
    if (uniqueOptions.length !== validOptions.length) {
      setError('Les options doivent être uniques');
      return;
    }

    try {
      setLoading(true);
      
      const betData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        league: formData.league,
        options: validOptions.map(opt => opt.trim()),
      };

      const response = await betsService.createBet(betData, token);
      
      setSuccess('Pari créé avec succès !');
      
      // Rediriger vers la page du pari créé après 2 secondes
      setTimeout(() => {
        navigate(`/bet/${response.bet_id}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du pari');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/bets')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Créer un nouveau pari
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
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

        <Box component="form" onSubmit={handleSubmit}>
          {/* Titre */}
          <TextField
            fullWidth
            label="Titre du pari *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            placeholder="Ex: Qui va gagner la finale de la Coupe du Monde ?"
            disabled={loading}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            placeholder="Décrivez votre pari en détail..."
            disabled={loading}
          />

          {/* Ligue */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Ligue / Catégorie</InputLabel>
            <Select
              name="league"
              value={formData.league}
              label="Ligue / Catégorie"
              onChange={handleChange}
              disabled={loading}
            >
              {predefinedLeagues.map((league) => (
                <MenuItem key={league} value={league}>
                  {league.charAt(0).toUpperCase() + league.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Options */}
          <Box mt={3} mb={2}>
            <Typography variant="h6" gutterBottom>
              Options de réponse *
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ajoutez entre 2 et 6 options possibles pour votre pari
            </Typography>
          </Box>

          {formData.options.map((option, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={2}>
              <Chip
                label={`${index + 1}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <TextField
                fullWidth
                label={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Ex: ${index === 0 ? 'Équipe A' : index === 1 ? 'Équipe B' : 'Match nul'}`}
                disabled={loading}
              />
              {formData.options.length > 2 && (
                <IconButton
                  onClick={() => removeOption(index)}
                  color="error"
                  disabled={loading}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}

          {/* Bouton d'ajout d'option */}
          {formData.options.length < 6 && (
            <Button
              startIcon={<Add />}
              onClick={addOption}
              variant="outlined"
              sx={{ mb: 3 }}
              disabled={loading}
            >
              Ajouter une option
            </Button>
          )}

          {/* Aperçu */}
          <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Aperçu
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {formData.title || 'Titre du pari'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formData.description || 'Description du pari'}
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <Chip label={formData.league} size="small" color="primary" />
            </Box>
            <Typography variant="body2" gutterBottom>
              Options disponibles :
            </Typography>
            {formData.options
              .filter(opt => opt.trim() !== '')
              .map((option, index) => (
                <Chip
                  key={index}
                  label={option}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
          </Box>

          {/* Boutons */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/bets')}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Créer le pari'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateBetPage;