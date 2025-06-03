import axios from 'axios';

const API_BASE_URL = 'https://paris-backend-rc8w.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Services d'authentification
export const authService = {
  register: (userData) => 
    api.post('/auth/register', userData).then(res => res.data),
  
  login: (userData) => 
    api.post('/auth/login', userData).then(res => res.data),
  
  logout: (token) => 
    api.post(`/auth/logout?token=${token}`).then(res => res.data),
  
  getProfile: (token) => 
    api.get(`/users/me?token=${token}`).then(res => res.data),
};

// Services des paris
export const betsService = {
  getBets: () => 
    api.get('/bets/').then(res => res.data),
  
  createBet: (betData, token) => 
    api.post(`/bets/?token=${token}`, betData).then(res => res.data),
  
  getBetDetails: (betId) => 
    api.get(`/bets/${betId}`).then(res => res.data),
  
  voteBet: (betId, voteData, token) => 
    api.post(`/bets/${betId}/vote?token=${token}`, voteData).then(res => res.data),
  
  resolveBet: (betId, resolution, token) => 
    api.post(`/bets/${betId}/resolve?token=${token}`, resolution).then(res => res.data),
};

// Services du classement
export const rankingService = {
  getRanking: (league = null) => {
    const url = league ? `/ranking?league=${league}` : '/ranking';
    return api.get(url).then(res => res.data);
  },
};

export default api;