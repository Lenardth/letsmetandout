// utils/api.js
import axios from 'axios';

// Replace with your computer's local IP address
const API_BASE_URL = 'http://192.168.1.10:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} );

export default apiClient;
