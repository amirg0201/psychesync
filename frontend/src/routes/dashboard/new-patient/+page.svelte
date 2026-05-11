<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let document = '';
  let password = 'Paciente123*'; // Password por defecto para que el paciente la cambie luego
  let errorMsg = '';

  async function registerPatient() {
    try {
      // Usamos el endpoint de auth pero forzando el rol PATIENT
      await api.post('/api/auth/register', { name, email, password, role: 'PATIENT', document });
      await goto('/dashboard');
    } catch (e: any) {
      errorMsg = e.message;
    }
  }
</script>

<div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
  <h2 class="text-2xl font-bold mb-6">Registrar Nuevo Paciente</h2>
  <form on:submit|preventDefault={registerPatient} class="space-y-4">
    <input type="text" bind:value={name} placeholder="Nombre completo" class="w-full p-2 border rounded" required />
    <input type="email" bind:value={email} placeholder="Correo electrónico" class="w-full p-2 border rounded" required />
    <input type="text" bind:value={document} placeholder="Cédula de Identidad (10 dígitos)" class="w-full p-2 border rounded" required />
    
    {#if errorMsg} <p class="text-red-500">{errorMsg}</p> {/if}
    
    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded font-bold">Guardar Paciente</button>
  </form>
</div>