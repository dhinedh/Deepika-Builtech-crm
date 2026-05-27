import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Secure fetch wrapper that automatically attaches the Supabase JWT access token
 * to every HTTP request. Centralizing this logic ensures high security for all data fetching.
 */
export const secureFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Get current session securely from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
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
