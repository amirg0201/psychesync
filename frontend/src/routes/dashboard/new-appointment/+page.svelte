<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  interface Patient {
    _id: string;
    name: string;
    email: string;
  }

  let patients = $state<Patient[]>([]);
  let selectedPatientId = $state("");
  let date = $state("");
  let priority = $state(1);
  let expectedIntensity = $state(5);
  let errorMsg = $state("");
  let loadingPatients = $state(true);
  let saving = $state(false);

  onMount(async () => {
    // Guardia de navegación
    if (!$auth.token) {
      await goto('/login');
      return;
    }

    try {
      // Carga dinámica de pacientes para el Dropdown relacional
      patients = await api.get('/api/patients');
    } catch (e: any) {
      errorMsg = "Error al cargar pacientes: " + e.message;
    } finally {
      loadingPatients = false;
    }
  });

  async function saveAppointment() {
    saving = true;
    errorMsg = "";
    
    try {
      await api.post('/api/appointments', {
        patientId: selectedPatientId,
        date,
        priority: Number(priority),
        expectedIntensity: Number(expectedIntensity)
      });
      await goto('/dashboard');
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center px-4 py-8 relative overflow-hidden font-sans">
  
  <!-- Glows decorativos de fondo -->
  <div class="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

  <!-- Glass Card -->
  <div class="max-w-lg w-full backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
    
    <!-- Encabezado -->
    <div class="mb-6">
      <a href="/dashboard" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 mb-4 active:scale-95 transition-transform w-fit">
        <span>←</span> Volver al Panel
      </a>
      <h2 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">
        Agendar Consulta
      </h2>
      <p class="text-xs text-slate-400 leading-relaxed mt-1">
        Crea una sesión clínica vinculando un perfil de paciente registrado. Planifica la prioridad de atención e intensidad cognitiva esperada.
      </p>
    </div>

    <!-- Formulario -->
    <form onsubmit={preventDefault => { preventDefault.preventDefault(); saveAppointment(); }} class="space-y-5">
      
      <!-- Paciente Dropdown -->
      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="patient-select">Seleccionar Paciente</label>
        {#if loadingPatients}
          <div class="w-full py-2.5 px-4 bg-slate-950/30 border border-slate-800/60 text-slate-500 rounded-xl text-sm flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando pacientes relacionales...</span>
          </div>
        {:else}
          <select 
            id="patient-select"
            bind:value={selectedPatientId} 
            required 
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm appearance-none cursor-pointer"
          >
            <option value="" class="bg-slate-900">-- Elige un paciente --</option>
            {#each patients as p}
              <option value={p._id} class="bg-slate-900">{p.name} ({p.email})</option>
            {/each}
          </select>
        {/if}
      </div>

      <!-- Fila de Prioridad e Intensidad -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="priority-select">Prioridad Clinica</label>
          <select 
            id="priority-select"
            bind:value={priority} 
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm cursor-pointer"
          >
            <option value={1} class="bg-slate-900">1 - Baja</option>
            <option value={2} class="bg-slate-900">2 - Media</option>
            <option value={3} class="bg-slate-900">3 - Alta</option>
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="intensity-input">Intensidad Esperada (1-10)</label>
          <input 
            type="number" 
            id="intensity-input"
            min="1" 
            max="10" 
            bind:value={expectedIntensity} 
            class="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm" 
            required
          />
        </div>
      </div>

      <!-- Fecha y hora -->
      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="date-input">Fecha y Hora de la Consulta</label>
        <input 
          type="datetime-local" 
          id="date-input"
          bind:value={date} 
          required 
          class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-slate-200 text-sm cursor-pointer" 
        />
      </div>

      {#if errorMsg} 
        <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium leading-relaxed">
          {errorMsg}
        </div>
      {/if}

      <!-- Botón principal -->
      <button 
        type="submit" 
        disabled={saving || loadingPatients}
        class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/15 transition shadow-md disabled:opacity-50 active:scale-98 mt-2"
      >
        {#if saving}
          <div class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creando Cita...</span>
          </div>
        {:else}
          <span>Confirmar Cita</span>
        {/if}
      </button>
    </form>
  </div>
</div>