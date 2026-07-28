import { authService } from './auth';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deepika-builtech-crm-4jj1.onrender.com/api';

/**
 * Secure fetch wrapper that automatically attaches the JWT access token
 * to every HTTP request. Centralizing this logic ensures high security for all data fetching.
 */
export const secureFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Get current session securely
  const { data: { session } } = await authService.getSession();
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Attach Bearer token if user is authenticated
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Clean up local session and logout state if token is unauthorized/invalid/expired
    await authService.signOut();
    useAuthStore.getState().logout();
    throw new Error('Unauthorized: Invalid or expired token');
  }

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // JSON parse failed
    }
    throw new Error(errorMsg);
  }

  return response.json();
};
