<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  let patients: any[] = [];
  let selectedPatientId = "";
  let date = "";
  let priority = 1;
  let expectedIntensity = 5;
  let errorMsg = "";

  onMount(async () => {
    // 🚨 CARGA DINÁMICA: Traemos los pacientes para el Dropdown
    patients = await api.get('/api/patients');
  });

  async function saveAppointment() {
    try {
      await api.post('/api/appointments', {
        patientId: selectedPatientId,
        date,
        priority: Number(priority),
        expectedIntensity: Number(expectedIntensity)
      });
      goto('/dashboard');
    } catch (e: any) {
      errorMsg = e.message;
    }
  }
</script>

<div class="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
  <h2 class="text-2xl font-bold mb-6 text-slate-800">Agendar Sesión Clínica</h2>

  <form on:submit|preventDefault={saveAppointment} class="space-y-5">
    <div>
      <label class="block text-sm font-medium text-slate-700">Seleccionar Paciente</label>
      <select bind:value={selectedPatientId} required class="w-full mt-1 p-2 border rounded-md">
        <option value="">-- Elige un paciente --</option>
        {#each patients as p}
          <option value={p._id}>{p.name}</option>
        {/each}
      </select>
    </div>


    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700">Prioridad</label>
        <select bind:value={priority} class="w-full mt-1 p-2 border rounded-md">
          <option value={1}>Baja</option>
          <option value={2}>Media</option>
          <option value={3}>Alta</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700">Intensidad Esperada</label>
        <input type="number" min="1" max="10" bind:value={expectedIntensity} class="w-full mt-1 p-2 border rounded-md" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700">Fecha de Cita</label>
      <input type="datetime-local" bind:value={date} required class="w-full mt-1 p-2 border rounded-md" />
    </div>

    {#if errorMsg} <p class="text-red-500 font-bold bg-red-50 p-2 rounded">{errorMsg}</p> {/if}

    <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
      Confirmar Cita
    </button>
  </form>
</div>