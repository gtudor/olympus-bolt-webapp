const API_BASE = import.meta.env.PROD ? 'https://gcp.olympus.io' : '/olympus-api';

export const getApiUrl = (endpoint) => `${API_BASE}${endpoint}`;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response;
};
