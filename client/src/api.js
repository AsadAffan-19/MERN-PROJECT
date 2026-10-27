import axios from 'axios';

// All requests go to the Express server. Override with VITE_API_URL in client/.env if needed.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

export default api;
