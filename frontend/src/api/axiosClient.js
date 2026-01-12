import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced resilient request function
export const resilientRequest = async (config, options = {}) => {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    exponentialBackoff = true,
    fallbackData = null,
    serviceName = 'unknown'
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axiosClient(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response.status !== 408 && error.response.status !== 429) {
          break;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay;

      console.warn(`${serviceName}: Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Return error state instead of throwing
  return {
    success: false,
    error: true,
    message: lastError?.message || 'Request failed',
    status: lastError?.response?.status,
    data: fallbackData,
    serviceName
  };
};

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData uploads by removing Content-Type header to allow automatic multipart setting
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Instead of redirecting, let the component handle the error
      // The AuthContext will handle invalidating the session
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
