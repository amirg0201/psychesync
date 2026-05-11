<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Seguridad básica: Si no hay token, lo mandamos al login
  onMount(async () => {
    if (!$auth.token) {
      await goto('/login');
    }
  });

  async function handleLogout() {
    auth.set({ token: null, user: null });
    await goto('/login');
  }
</script>

<div class="min-h-screen bg-slate-50 p-6">
  <nav class="max-w-6xl mx-auto flex justify-between items-center mb-10">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Panel de Control</h1>
      <p class="text-slate-500">Bienvenido de nuevo, Dr. {$auth.user?.name || 'Profesional'}</p>
    </div>
    <button 
      on:click={handleLogout}
      class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
    >
      Cerrar Sesión
    </button>
  </nav>

  <main class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-slate-500 text-sm font-bold uppercase tracking-wider">Estado de Burnout</h3>
      <p class="text-3xl font-bold text-green-500 mt-2">Nivel Óptimo</p>
      <p class="text-xs text-slate-400 mt-1">Basado en tus últimas 5 sesiones.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-slate-500 text-sm font-bold uppercase tracking-wider">Citas Hoy</h3>
      <p class="text-3xl font-bold text-slate-800 mt-2">0</p>
      <p class="text-xs text-slate-400 mt-1">No tienes sesiones pendientes para hoy.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-slate-500 text-sm font-bold uppercase tracking-wider">Productividad Semanal</h3>
      <p class="text-3xl font-bold text-blue-600 mt-2">0 pts</p>
      <p class="text-xs text-slate-400 mt-1">Puntos acumulados según intensidad.</p>
    </div>
  </main>
</div>