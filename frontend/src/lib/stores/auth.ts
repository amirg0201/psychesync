import { writable } from 'svelte/store';

// Estado inicial: buscamos si ya hay una sesión en el navegador
const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;

export const auth = writable(stored ? JSON.parse(stored) : { token: null, user: null });

// Cada vez que el store cambie, lo guardamos en localStorage
auth.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_session', JSON.stringify(value));
  }
});