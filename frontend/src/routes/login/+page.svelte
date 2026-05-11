<script lang="ts">
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';
  let loading = false;

  async function handleLogin() {
    loading = true;
    errorMsg = '';
    
    try {
      // Llamada a tu backend (Hono)
      const data = await api.post('/api/auth/login', { email, password });
      
      // Actualizamos el store global con el Token y datos del Psicólogo
      auth.set({
        token: data.token,
        user: { name: data.name, role: data.role }
      });

      // Redirección exitosa al panel principal
      await goto('/dashboard');
    } catch (err) {
      const e = err as Error;
      errorMsg = e.message || 'Credenciales incorrectas';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
  <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600">PsycheSync</h1>
      <p class="text-slate-500 mt-2">Acceso para profesionales</p>
    </div>

    <form on:submit|preventDefault={handleLogin} class="space-y-5">
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-1" for="email">Email institucional</label>
        <input 
          type="email" 
          bind:value={email}
          required
          placeholder="doctor@psychesync.com"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-1" for="password">Contraseña</label>
        <input 
          type="password" 
          bind:value={password}
          required
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {#if errorMsg}
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm font-medium">{errorMsg}</p>
        </div>
      {/if}

      <button 
        type="submit" 
        disabled={loading}
        class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
      >
        {loading ? 'Validando...' : 'Entrar al Sistema'}
      </button>
    </form>
  </div>
</div>