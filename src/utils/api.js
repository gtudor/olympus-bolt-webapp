const API_BASE = import.meta.env.PROD ? 'https://gcp.olympus.io' : '/olympus-api';

export const getApiUrl = (endpoint) => `${API_BASE}${endpoint}`;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);

  // Determine if body is FormData
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
    // Only set Content-Type if not uploading FormData
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response;
};
