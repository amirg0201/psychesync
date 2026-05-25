<script lang="ts">
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let name = $state('');
  let errorMsg = $state('');
  let successMsg = $state('');
  let loading = $state(false);
  let isRegister = $state(false);

  async function handleSubmit() {
    loading = true;
    errorMsg = '';
    successMsg = '';
    
    try {
      if (isRegister) {
        // Registro del Psicólogo (Rol ADMIN en el Back-end)
        await api.post('/api/auth/register', { 
          name, 
          email, 
          password, 
          role: 'ADMIN' 
        });
        successMsg = '¡Profesional registrado con éxito! Ya puedes iniciar sesión.';
        isRegister = false;
        // Reset campos
        password = '';
      } else {
        // Llamada a backend (Hono)
        const data = await api.post('/api/auth/login', { email, password });
        
        // Actualizamos el store global con el Token y datos del Psicólogo
        auth.set({
          token: data.token,
          user: { name: data.name, role: data.role }
        });

        // Redirección al panel principal
        await goto('/dashboard');
      }
    } catch (err) {
      const e = err as Error;
      errorMsg = e.message || 'Ocurrió un error en el sistema';
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isRegister = !isRegister;
    errorMsg = '';
    successMsg = '';
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 relative overflow-hidden font-sans">
  
  <!-- Efectos de Luces de Fondo (Glows) -->
  <div class="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>

  <!-- Contenedor Principal (Glassmorphism) -->
  <div class="max-w-md w-full backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10 transition-all duration-300">
    
    <!-- Logo e Identidad -->
    <div class="text-center mb-8">
      <div class="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-lg mb-3">
        PS
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">PsycheSync</h1>
      <p class="text-slate-400 text-xs mt-1.5 font-medium uppercase tracking-wider">
        {isRegister ? 'Registro de Profesional' : 'Acceso para Profesionales'}
      </p>
    </div>

    <!-- Pestañas de Alternancia -->
    <div class="grid grid-cols-2 bg-slate-950/40 p-1 rounded-lg border border-slate-800/50 mb-6">
      <button 
        type="button"
        onclick={() => { if (isRegister) toggleMode(); }}
        class="py-1.5 text-xs font-bold rounded-md transition-all {!isRegister ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
      >
        Entrar
      </button>
      <button 
        type="button"
        onclick={() => { if (!isRegister) toggleMode(); }}
        class="py-1.5 text-xs font-bold rounded-md transition-all {isRegister ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
      >
        Crear Cuenta
      </button>
    </div>

    <!-- Formulario -->
    <form onsubmit={preventDefault => { preventDefault.preventDefault(); handleSubmit(); }} class="space-y-4">
      
      {#if isRegister}
        <div class="transition-all duration-300">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="name">Nombre Profesional</label>
          <input 
            type="text" 
            id="name"
            bind:value={name}
            required
            placeholder="Dr(a). Nombre Apellido"
            class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600"
          />
        </div>
      {/if}

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="email">Correo Institucional</label>
        <input 
          type="email" 
          id="email"
          bind:value={email}
          required
          placeholder="doctor@psychesync.com"
          class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="password">Contraseña</label>
        <input 
          type="password" 
          id="password"
          bind:value={password}
          required
          placeholder="••••••••"
          class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm placeholder-slate-600"
        />
      </div>

      <!-- Alertas de Error / Éxito -->
      {#if errorMsg}
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium leading-relaxed">
          {errorMsg}
        </div>
      {/if}

      {#if successMsg}
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium leading-relaxed">
          {successMsg}
        </div>
      {/if}

      <!-- Botón de Envío -->
      <button 
        type="submit" 
        disabled={loading}
        class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/15 transition shadow-md disabled:opacity-50 active:scale-98 mt-2"
      >
        {#if loading}
          <div class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando...</span>
          </div>
        {:else}
          <span>{isRegister ? 'Crear Cuenta Profesional' : 'Ingresar al Portal'}</span>
        {/if}
      </button>
    </form>
  </div>
</div>