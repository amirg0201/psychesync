<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  type Appointment = {
    _id: string;
    date: string;
    priority: number;
    status: string;
    performanceScore?: number;
    patientId?: {
      name: string;
    };
  };

  let appointments: Appointment[] = [];
  let loading = true;
  
  let selectedAppId = "";
  let realIntensity = 5;
  let showModal = false;
  let lastResult: any = null;

  // Función para abrir el proceso de cierre
  function openResolveModal(id: string) {
    selectedAppId = id;
    showModal = true;
  }

  // Función para llamar al backend y resolver la cita
  async function resolveAppointment() {
    try {
      const result = await api.request('PATCH', `/api/appointments/${selectedAppId}/resolve`, {
        realIntensity: Number(realIntensity)
      });
      lastResult = result;
      showModal = false;
      
      // Recargamos las citas para ver los cambios
      appointments = await api.get('/api/appointments');
      
      // Si el Smart Buffer se activó, lanzamos una alerta
      if (result.smartBufferActive) {
        alert(result.alert);
      }
    } catch (e: any) {
      alert("Error al finalizar: " + e.message);
    }
  }


  onMount(async () => {
    if (!$auth.token) {
      goto('/login');
      return;
    }

    try {
      // 🚀 Traemos las citas del backend
      appointments = await api.get('/api/appointments');
    } catch (e) {
      console.error("Error al cargar citas:", e);
    } finally {
      loading = false;
    }
  });

  // Lógica para contar citas de hoy
  $: appointmentsToday = appointments.filter(app => {
    const today = new Date().toISOString().split('T')[0];
    return app.date.startsWith(today);
  }).length;

  async function handleLogout() {
    auth.set({ token: null, user: null });
    goto('/login');
  }
</script>

<div class="min-h-screen bg-slate-50 p-6">
  <nav class="max-w-6xl mx-auto flex justify-between items-center mb-10">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Panel de Control</h1>
      <p class="text-slate-500">Bienvenido, Dr. {$auth.user?.name || 'Profesional'}</p>
    </div>
    <button on:click={handleLogout} class="text-red-600 font-medium">Cerrar Sesión</button>
  </nav>

  <main class="max-w-6xl mx-auto">
    <div class="flex gap-4 mb-10">
      <a href="/dashboard/new-patient" class="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
        + Registrar Paciente
      </a>
      <a href="/dashboard/new-appointment" class="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
        + Nueva Cita
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-bold uppercase">Estado de Burnout</h3>
        <p class="text-3xl font-bold text-green-500 mt-2">Nivel Óptimo</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-bold uppercase">Citas Hoy</h3>
        <p class="text-3xl font-bold text-slate-800 mt-2">{appointmentsToday}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-bold uppercase">Total Citas</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">{appointments.length}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-800">Próximas Sesiones</h2>
      </div>
      
      {#if loading}
        <p class="p-10 text-center text-slate-400">Cargando agenda...</p>
      {:else if appointments.length === 0}
        <p class="p-10 text-center text-slate-400">No hay citas agendadas aún.</p>
      {:else}
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th class="px-6 py-4">Paciente</th>
              <th class="px-6 py-4">Fecha / Hora</th>
              <th class="px-6 py-4">Prioridad</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each appointments as app (app._id)}
              <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-medium text-slate-700">
                  {app.patientId?.name || 'Desconocido'}
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {new Date(app.date).toLocaleString()}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs font-bold 
                    {app.priority === 3 ? 'bg-red-100 text-red-600' : 
                     app.priority === 2 ? 'bg-orange-100 text-orange-600' : 
                     'bg-green-100 text-green-600'}">
                    {app.priority === 3 ? 'Alta' : app.priority === 2 ? 'Media' : 'Baja'}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500 italic">
                  {app.status === 'open' ? 'Pendiente' : 'Finalizada'}
                </td>
                <td class="px-6 py-4 text-right">
                  {#if app.status === 'open'}
                    <button 
                      on:click={() => openResolveModal(app._id)}
                      class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition"
                    >
                      Finalizar
                    </button>
                  {:else}
                    <span class="text-xs font-bold text-slate-400">Puntaje: {app.performanceScore} pts</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </main>
</div>

{#if showModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl">
      <h3 class="text-xl font-bold mb-4">Finalizar Sesión</h3>
      <p class="text-slate-600 text-sm mb-6">
        ¿Qué tan intensa fue realmente esta sesión? (1 al 10)
      </p>
      
      <input 
        type="range" min="1" max="10" 
        bind:value={realIntensity} 
        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div class="flex justify-between text-xs font-bold text-slate-400 mt-2">
        <span>1 (Tranquila)</span>
        <span class="text-blue-600 text-lg">{realIntensity}</span>
        <span>10 (Extenuante)</span>
      </div>

      <div class="flex gap-3 mt-8">
        <button on:click={() => showModal = false} class="flex-1 py-2 text-slate-500 font-medium">Cancelar</button>
        <button on:click={resolveAppointment} class="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Guardar</button>
      </div>
    </div>
  </div>
{/if}