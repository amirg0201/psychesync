import { PUBLIC_API_URL } from '$env/static/public';
import { get } from 'svelte/store';
import { auth } from './stores/auth';

export const api = {
  async request(method: string, endpoint: string, data?: unknown) {
    // Obtenemos el token directamente del store de Svelte
    const { token } = get(auth);

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    // Si tenemos un token, lo inyectamos en el Header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error en la petición');
    return result;
  },

  // Atajos para no repetir código
  get(endpoint: string) { return this.request('GET', endpoint); },
  post(endpoint: string, data: unknown) { return this.request('POST', endpoint, data); }
};