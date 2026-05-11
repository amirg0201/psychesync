import { PUBLIC_API_URL } from '$env/static/public';

export const api = {
  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error en la petición');
    return result;
  }
};