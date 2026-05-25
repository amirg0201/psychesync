<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let name = $state('');
  let email = $state('');
  let documentVal = $state('');
  let errorMsg = $state('');
  let loading = $state(false);
  const dniPattern = "[0-9]{10}";

  // Guardia de Navegación a nivel cliente
  onMount(async () => {
    if (!$auth.token) {
      await goto('/login');
    }
  });

  async function registerPatient() {
    loading = true;
    errorMsg = '';
    
    try {
      // Registrar paciente en la nueva colección independiente
      await api.post('/api/patients', { 
        name, 
        email, 
        document: documentVal 
      });
      await goto('/dashboard');
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center px-4 relative overflow-hidden font-sans">
  
  <!-- Glows decorativos de fondo -->
  <div class="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

  <!-- Glass Card -->
  <div class="max-w-md w-full backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
    
    <!-- Encabezado -->
    <div class="mb-6">
      <a href="/dashboard" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 mb-4 active:scale-95 transition-transform w-fit">
        <span>←</span> Volver al Panel
      </a>
      <h2 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">
        Registrar Paciente
      </h2>
      <p class="text-xs text-slate-400 leading-relaxed mt-1">
        Crea un perfil clínico para el paciente. El número de identificación oficial (DNI/Cédula) debe tener exactamente 10 dígitos.
      </p>
    </div>

    <!-- Formulario -->
    <form onsubmit={preventDefault => { preventDefault.preventDefault(); registerPatient(); }} class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="name">Nombre Completo</label>
        <input 
          type="text" 
          id="name"
          bind:value={name} 
          placeholder="Ej: Carlos Mendoza" 
          class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600" 
          required 
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="email">Correo Electrónico</label>
        <input 
          type="email" 
          id="email"
          bind:value={email} 
          placeholder="carlos.mendoza@email.com" 
          class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600" 
          required 
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="document">Cédula / DNI (10 dígitos)</label>
        <input 
          type="text" 
          id="document"
          bind:value={documentVal} 
          placeholder="0999999999" 
          pattern={dniPattern}
          maxlength="10"
          title="Debe contener exactamente 10 números"
          class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600" 
          required 
        />
      </div>
      
      {#if errorMsg} 
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium leading-relaxed">
          {errorMsg}
        </div>
      {/if}
      
      <button 
        type="submit" 
        disabled={loading}
        class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/15 transition shadow-md disabled:opacity-50 active:scale-98 mt-2"
      >
        {#if loading}
          <div class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Guardando Paciente...</span>
          </div>
        {:else}
          <span>Guardar Paciente</span>
        {/if}
      </button>
    </form>
  </div>
</div>