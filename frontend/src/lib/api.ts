const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  baseUrl: API_BASE_URL,
  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
  units: `${API_BASE_URL}/units`,
  transactions: `${API_BASE_URL}/transactions`,
  auth: `${API_BASE_URL}/auth`
};
