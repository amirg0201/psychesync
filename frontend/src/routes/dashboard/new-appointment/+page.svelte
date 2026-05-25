<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
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
  let date = $state("");           // ISO string final que se envía al backend
  let priority = $state(1);
  let expectedIntensity = $state(5);
  let errorMsg = $state("");
  let loadingPatients = $state(true);
  let saving = $state(false);

  // ─── Estado del Calendario ───
  const today = new Date();
  let showCalendar = $state(false);
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth()); // 0-indexed
  let selectedDay = $state<number | null>(null);
  let selectedHour = $state(9);
  let selectedMinute = $state(0);

  const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // Calcula los días del mes actual a mostrar en la cuadrícula
  const calendarDays = $derived.by(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Convertir a Lun=0
    const offset = (firstDay === 0 ? 6 : firstDay - 1);
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  });

  // Texto legible del día/hora seleccionados
  const dateDisplayLabel = $derived.by(() => {
    if (!selectedDay) return 'Seleccionar fecha y hora';
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    const hh = String(selectedHour).padStart(2, '0');
    const min = String(selectedMinute).padStart(2, '0');
    return `${dd}/${mm}/${viewYear} – ${hh}:${min}`;
  });

  function prevMonth() {
    if (viewMonth === 0) { viewMonth = 11; viewYear -= 1; }
    else viewMonth -= 1;
    selectedDay = null;
  }

  function nextMonth() {
    if (viewMonth === 11) { viewMonth = 0; viewYear += 1; }
    else viewMonth += 1;
    selectedDay = null;
  }

  function selectDay(d: number | null) {
    if (!d) return;
    const now = new Date();
    const isPast = new Date(viewYear, viewMonth, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (isPast) return;
    selectedDay = d;
  }

  function confirmDate() {
    if (!selectedDay) return;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    const hh = String(selectedHour).padStart(2, '0');
    const min = String(selectedMinute).padStart(2, '0');
    date = `${viewYear}-${mm}-${dd}T${hh}:${min}`;
    showCalendar = false;
  }

  function isDayPast(d: number | null): boolean {
    if (!d) return false;
    const now = new Date();
    return new Date(viewYear, viewMonth, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function isToday(d: number | null): boolean {
    if (!d) return false;
    return d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  onMount(async () => {
    if (!$auth.token) {
      await goto('/login');
      return;
    }
    try {
      patients = await api.get('/api/patients');
    } catch (e: any) {
      errorMsg = "Error al cargar pacientes: " + e.message;
    } finally {
      loadingPatients = false;
    }
  });

  async function saveAppointment() {
    if (!date) { errorMsg = "Por favor selecciona la fecha y hora de la consulta."; return; }
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

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-start justify-center px-4 py-12 relative overflow-x-hidden font-sans">
  
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
    <form onsubmit={e => { e.preventDefault(); saveAppointment(); }} class="space-y-5">
      
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
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="priority-select">Prioridad Clínica</label>
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

      <!-- ─── SELECTOR DE FECHA Y HORA (CUSTOM CALENDAR) ─── -->
      <div>
        <label for="date-trigger" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Fecha y Hora de la Consulta
        </label>

        <!-- Botón que abre el calendario -->
        <button
          type="button"
          id="date-trigger"
          onclick={() => showCalendar = !showCalendar}
          class="w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-left flex items-center justify-between transition-all
            {date ? 'border-indigo-500/60 text-slate-100' : 'border-slate-800/60 text-slate-500'}
            hover:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span class="flex items-center gap-2.5">
            <svg class="w-4 h-4 {date ? 'text-indigo-400' : 'text-slate-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {dateDisplayLabel}
          </span>
          <svg class="w-3.5 h-3.5 text-slate-500 transition-transform {showCalendar ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Panel del Calendario (MODAL OVERLAY: se muestra centrado y permite scroll interno) -->
        {#if showCalendar}
          <div 
            transition:fade={{ duration: 150 }}
            class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
          >
            <div 
              class="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
            >
              <!-- Cabecera de la Modal -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-950/40">
                <h3 class="text-sm font-bold text-slate-200 tracking-wide">Seleccionar Fecha y Hora</h3>
                <button 
                  type="button" 
                  onclick={() => showCalendar = false} 
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800/60 transition text-slate-400 hover:text-slate-100"
                  aria-label="Cerrar calendario"
                >
                  ✕
                </button>
              </div>

              <!-- Contenido Scrollable si es necesario -->
              <div class="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                
                <!-- Selector de Mes / Año -->
                <div class="flex items-center justify-between py-1 bg-slate-950/30 rounded-xl px-2 border border-slate-800/40">
                  <button type="button" onclick={prevMonth} aria-label="Mes anterior"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800/60 transition text-slate-400 hover:text-slate-100 font-bold">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>

                  <span class="text-sm font-bold text-slate-200 tracking-wide">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>

                  <button type="button" onclick={nextMonth} aria-label="Mes siguiente"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800/60 transition text-slate-400 hover:text-slate-100 font-bold">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

                <!-- Grid de días -->
                <div>
                  <!-- Encabezados de Días de la Semana -->
                  <div class="grid grid-cols-7 mb-1.5">
                    {#each DAYS_OF_WEEK as d}
                      <div class="text-center text-[10px] font-bold text-slate-500 uppercase py-1">{d}</div>
                    {/each}
                  </div>

                  <!-- Grid de días del mes -->
                  <div class="grid grid-cols-7 gap-y-1">
                    {#each calendarDays as day}
                      <div class="flex items-center justify-center">
                        {#if day !== null}
                          <button
                            type="button"
                            onclick={() => selectDay(day)}
                            disabled={isDayPast(day)}
                            class="w-9 h-9 text-xs rounded-xl flex items-center justify-center font-semibold transition-all select-none
                              {selectedDay === day ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold' 
                               : isToday(day) ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/30'
                               : isDayPast(day) ? 'text-slate-700 cursor-not-allowed'
                               : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 cursor-pointer'}"
                          >
                            {day}
                          </button>
                        {:else}
                          <span class="w-9 h-9"></span>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Selector de Hora -->
                <div class="border-t border-slate-800/60 pt-4">
                  {#if selectedDay !== null}
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Hora de la Consulta</p>
                    <div class="flex items-center gap-4 bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl">
                      <!-- Horas -->
                      <div class="flex-1 flex flex-col items-center gap-1.5">
                        <button type="button" onclick={() => selectedHour = (selectedHour + 1) % 24}
                          class="w-full py-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/55 rounded-lg transition text-xs">▲</button>
                        <span class="text-3xl font-black text-indigo-300 tabular-nums w-12 text-center">
                          {String(selectedHour).padStart(2, '0')}
                        </span>
                        <button type="button" onclick={() => selectedHour = (selectedHour - 1 + 24) % 24}
                          class="w-full py-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/55 rounded-lg transition text-xs">▼</button>
                      </div>
                      <span class="text-2xl font-black text-slate-600 mb-0.5">:</span>
                      <!-- Minutos (en intervalos de 15) -->
                      <div class="flex-1 flex flex-col items-center gap-1.5">
                        <button type="button" onclick={() => selectedMinute = (selectedMinute + 15) % 60}
                          class="w-full py-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/55 rounded-lg transition text-xs">▲</button>
                        <span class="text-3xl font-black text-indigo-300 tabular-nums w-12 text-center">
                          {String(selectedMinute).padStart(2, '0')}
                        </span>
                        <button type="button" onclick={() => selectedMinute = (selectedMinute - 15 + 60) % 60}
                          class="w-full py-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/55 rounded-lg transition text-xs">▼</button>
                      </div>
                    </div>
                  {:else}
                    <div class="p-6 bg-slate-950/20 border border-slate-800/30 rounded-xl text-center">
                      <p class="text-xs text-slate-500 font-medium italic">Selecciona un día para configurar la hora</p>
                    </div>
                  {/if}
                </div>

              </div>

              <!-- Footer de la Modal (Acciones) -->
              <div class="px-5 py-4 border-t border-slate-800/60 bg-slate-950/40 flex gap-3">
                <button
                  type="button"
                  onclick={() => showCalendar = false}
                  class="flex-1 py-3 border border-slate-800/80 hover:bg-slate-800/40 text-slate-300 text-xs font-bold rounded-xl transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onclick={confirmDate}
                  disabled={selectedDay === null}
                  class="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Confirmar Fecha y Hora
                </button>
              </div>

            </div>
          </div>
        {/if}
      </div>
      <!-- ─── FIN DEL SELECTOR DE FECHA ─── -->

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

<style>
  /* Estilo premium de la barra de desplazamiento interna del modal */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.4);
  }
</style>