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
    expectedIntensity: number;
    realIntensity?: number;
    performanceScore?: number;
    patientId?: {
      name: string;
      email: string;
      document: string;
    };
  };

  let appointments = $state<Appointment[]>([]);
  let loading = $state(true);
  
  let selectedAppId = $state("");
  let realIntensity = $state(5);
  let showModal = $state(false);
  let lastResult = $state<any>(null);

  // Estados de notificación customizada (reemplaza alert)
  let showNotification = $state(false);
  let notificationType = $state<'success' | 'warning' | 'error'>('success');
  let notificationMsg = $state("");

  function triggerNotification(type: 'success' | 'warning' | 'error', message: string) {
    notificationType = type;
    notificationMsg = message;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 6000);
  }

  // Carga de datos
  async function loadData() {
    try {
      appointments = await api.get('/api/appointments');
    } catch (e: any) {
      triggerNotification('error', "Error al conectar con la base de datos: " + e.message);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (!$auth.token) {
      await goto('/login');
      return;
    }
    await loadData();
  });

  // Abrir proceso de cierre
  function openResolveModal(id: string) {
    selectedAppId = id;
    realIntensity = 5;
    showModal = true;
  }

  // Confirmar y resolver la cita
  async function resolveAppointment() {
    try {
      const result = await api.request('PATCH', `/api/appointments/${selectedAppId}/resolve`, {
        realIntensity: Number(realIntensity)
      });
      lastResult = result;
      showModal = false;
      
      // Recargar la lista
      await loadData();
      
      // Alertar de Smart Buffer de forma integrada en la UI
      if (result.smartBufferActive) {
        triggerNotification('warning', result.alert || "⚠️ Carga crítica detectada. Programando descanso obligatorio de 15 minutos.");
      } else {
        triggerNotification('success', "Sesión completada y puntuada con éxito.");
      }
    } catch (e: any) {
      triggerNotification('error', "Error al finalizar la sesión: " + e.message);
    }
  }

  // Métricas reactivas (Svelte 5 Runes equivalent / derived states)
  // appointments es un array de estado. Usamos getters reactivos nativos de Svelte 5.
  const appointmentsToday = $derived(
    appointments.filter(app => {
      const today = new Date().toISOString().split('T')[0];
      return app.date.startsWith(today);
    }).length
  );

  const resolvedAppointments = $derived(
    appointments
      .filter(app => app.status === 'resolved' && app.realIntensity !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  );

  const burnoutState = $derived.by(() => {
    if (resolvedAppointments.length === 0) {
      return {
        label: 'Sin Datos',
        colorClass: 'text-slate-400 bg-slate-900/40 border-slate-800/80 shadow-slate-950/20',
        textClass: 'text-slate-400',
        dotClass: 'bg-slate-400',
        desc: 'Completa tu primera sesión clínica para evaluar tu carga cognitiva.'
      };
    }

    const criticalCount = resolvedAppointments.filter(app => (app.realIntensity ?? 0) >= 8).length;
    const totalIntensity = resolvedAppointments.reduce((sum, app) => sum + (app.realIntensity ?? 0), 0);
    const avgIntensity = totalIntensity / resolvedAppointments.length;

    if (criticalCount >= 2) {
      return {
        label: 'Riesgo Crítico',
        colorClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30 shadow-rose-950/40 shadow-lg glow-rose',
        textClass: 'text-rose-400 font-extrabold',
        dotClass: 'bg-rose-500 animate-ping',
        desc: '⚠️ Detén tu agenda. La carga mental acumulada está en niveles críticos. Se recomienda descanso.'
      };
    } else if (criticalCount === 1 || avgIntensity >= 5.5) {
      return {
        label: 'Carga Elevada',
        colorClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30 shadow-amber-950/40',
        textClass: 'text-amber-400 font-bold',
        dotClass: 'bg-amber-500 animate-pulse',
        desc: 'Carga mental moderada/alta. Considera espaciar tus siguientes consultas.'
      };
    } else {
      return {
        label: 'Nivel Óptimo',
        colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30 shadow-emerald-950/40',
        textClass: 'text-emerald-400 font-bold',
        dotClass: 'bg-emerald-500',
        desc: 'Tu balance cognitivo se encuentra estable. Sigue con tus pautas de salud actual.'
      };
    }
  });

  async function handleLogout() {
    auth.set({ token: null, user: null });
    await goto('/login');
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 relative overflow-hidden font-sans pb-12">
  
  <!-- Efectos decorativos de fondo -->
  <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none"></div>

  <!-- TOAST NOTIFICATION -->
  {#if showNotification}
    <div 
      class="fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl backdrop-blur-xl border shadow-2xl flex items-start gap-3 transition-all duration-300 transform translate-y-0
        {notificationType === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' : ''}
        {notificationType === 'warning' ? 'bg-amber-950/85 border-amber-500/30 text-amber-200' : ''}
        {notificationType === 'error' ? 'bg-rose-950/85 border-rose-500/30 text-rose-200' : ''}"
    >
      {#if notificationType === 'warning'}
        <span class="text-xl">⚠️</span>
      {:else if notificationType === 'success'}
        <span class="text-xl">✨</span>
      {:else}
        <span class="text-xl">🛑</span>
      {/if}
      <div class="flex-1">
        <h4 class="font-bold text-sm">
          {notificationType === 'warning' ? 'Smart Buffer Activado' : notificationType === 'success' ? 'Éxito' : 'Error'}
        </h4>
        <p class="text-xs mt-1 leading-relaxed opacity-90">{notificationMsg}</p>
      </div>
      <button onclick={() => showNotification = false} class="text-xs font-bold hover:opacity-100 opacity-60">✕</button>
    </div>
  {/if}

  <!-- NAVBAR -->
  <nav class="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-10 border-b border-slate-800/40">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
        PS
      </div>
      <div>
        <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">PsycheSync</h1>
        <p class="text-xs text-slate-400 font-medium">Dr. {$auth.user?.name || 'Profesional'}</p>
      </div>
    </div>
    <button 
      onclick={handleLogout} 
      class="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all active:scale-95"
    >
      Cerrar Sesión
    </button>
  </nav>

  <!-- MAIN CONTAINER -->
  <main class="max-w-6xl mx-auto px-6 mt-10 relative z-10">
    
    <!-- ACCIONES RÁPIDAS -->
    <div class="flex flex-wrap gap-4 mb-10">
      <a 
        href="/dashboard/new-patient" 
        class="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 text-slate-200 hover:bg-slate-800/60 hover:text-indigo-400 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-98 flex items-center gap-2 group"
      >
        <span class="text-indigo-400 group-hover:scale-110 transition-transform">+</span> Registrar Paciente
      </a>
      <a 
        href="/dashboard/new-appointment" 
        class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/20 hover:brightness-110 transition-all active:scale-98 flex items-center gap-2"
      >
        <span>+</span> Agendar Nueva Cita
      </a>
    </div>

    <!-- METRICS GRID -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      
      <!-- ESTADO DE BURNOUT (DINÁMICO & REACTIVO) -->
      <div class="p-6 rounded-2xl border transition-all duration-300 {burnoutState.colorClass}">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-slate-400 text-xs font-bold uppercase tracking-wider">Estado de Burnout</h3>
          <span class="h-2.5 w-2.5 rounded-full {burnoutState.dotClass}"></span>
        </div>
        <p class="text-2xl font-extrabold tracking-tight {burnoutState.textClass}">{burnoutState.label}</p>
        <p class="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
          {burnoutState.desc}
        </p>
      </div>

      <!-- CITAS HOY -->
      <div class="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-sm">
        <h3 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Citas Hoy</h3>
        <p class="text-3xl font-extrabold text-slate-100 tracking-tight">{appointmentsToday}</p>
        <p class="text-xs text-slate-400 mt-2 font-medium">Sesiones programadas para la jornada actual.</p>
      </div>

      <!-- TOTAL CITAS -->
      <div class="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-sm">
        <h3 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Historial Clínico</h3>
        <p class="text-3xl font-extrabold text-indigo-400 tracking-tight">{appointments.length}</p>
        <p class="text-xs text-slate-400 mt-2 font-medium">Citas totales gestionadas por el sistema.</p>
      </div>
    </div>

    <!-- PRÓXIMAS SESIONES -->
    <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      <div class="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/20">
        <h2 class="text-lg font-bold text-slate-200 tracking-tight">Próximas Sesiones Clínicas</h2>
        <span class="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-bold uppercase">
          Agenda Activa
        </span>
      </div>
      
      {#if loading}
        <div class="p-16 text-center">
          <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-400 text-sm">Sincronizando con base de datos...</p>
        </div>
      {:else if appointments.length === 0}
        <div class="p-16 text-center">
          <p class="text-slate-400 text-sm mb-2">No hay citas registradas en tu agenda médica.</p>
          <a href="/dashboard/new-appointment" class="text-indigo-400 hover:text-indigo-300 text-xs font-bold underline">
            Agendar tu primera consulta ahora
          </a>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-900/60 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800/80">
              <tr>
                <th class="px-6 py-4">Paciente</th>
                <th class="px-6 py-4">Fecha / Hora</th>
                <th class="px-6 py-4">Prioridad</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Cierre de Consulta</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              {#each appointments as app (app._id)}
                <tr class="hover:bg-slate-800/30 transition duration-150">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-200 text-sm">{app.patientId?.name || 'Desconocido'}</div>
                    <div class="text-slate-400 text-xs mt-0.5">{app.patientId?.email || 'Sin correo'}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-300 text-sm font-medium">
                    {new Date(app.date).toLocaleString('es-ES', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                      {app.priority === 3 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                       app.priority === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}">
                      {app.priority === 3 ? 'Alta' : app.priority === 2 ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs font-semibold">
                    {#if app.status === 'open'}
                      <span class="text-indigo-400 flex items-center gap-1.5">
                        <span class="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Pendiente
                      </span>
                    {:else}
                      <span class="text-slate-500 flex items-center gap-1.5">
                        <span class="h-1.5 w-1.5 rounded-full bg-slate-600"></span> Finalizada
                      </span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 text-right">
                    {#if app.status === 'open'}
                      <button 
                        onclick={() => openResolveModal(app._id)}
                        class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-95"
                      >
                        Finalizar Sesión
                      </button>
                    {:else}
                      <span class="text-xs font-bold px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-indigo-300">
                        {app.performanceScore !== undefined ? `${app.performanceScore.toFixed(0)} pts` : '--'}
                      </span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </main>
</div>

<!-- MODAL PARA RESOLVER CITA -->
{#if showModal}
  <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
    <div 
      class="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl max-w-md w-full shadow-2xl text-slate-100 transform scale-100 transition-all"
    >
      <h3 class="text-xl font-extrabold mb-2 bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">Cierre y Evaluación de Cita</h3>
      <p class="text-slate-400 text-xs leading-relaxed mb-6">
        Establece la intensidad de desgaste real experimentada durante la sesión clínica para actualizar tu motor de prevención de Burnout.
      </p>
      
      <!-- CONTROL DE INTENSIDAD -->
      <div class="bg-slate-950/50 border border-slate-800/60 p-5 rounded-xl mb-6">
        <label for="intensity-slider" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Nivel de Desgaste Real:
        </label>
        <input 
          id="intensity-slider"
          type="range" min="1" max="10" 
          bind:value={realIntensity} 
          class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div class="flex justify-between text-[10px] font-bold text-slate-500 mt-3">
          <span>1 (Tranquilo)</span>
          <span class="text-indigo-400 text-2xl font-black mt-[-4px]">{realIntensity}</span>
          <span>10 (Extenuante)</span>
        </div>
      </div>

      <!-- BOTONES -->
      <div class="flex gap-3">
        <button 
          onclick={() => showModal = false} 
          class="flex-1 py-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition font-bold"
        >
          Cancelar
        </button>
        <button 
          onclick={resolveAppointment} 
          class="flex-1 py-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
        >
          Guardar Cierre
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Personalización estética del input range */
  input[type="range"]::-webkit-slider-thumb {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  /* Animación glow suave para la tarjeta de alerta en rojo */
  .glow-rose {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.15);
  }
</style>