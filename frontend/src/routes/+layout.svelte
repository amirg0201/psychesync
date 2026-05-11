<script lang="ts">
  import '../app.css'; // Importante para Tailwind
  let { children } = $props();
</script>

<div class="app">
  <main>
    {@render children()}
  </main>
</div>

<style>
  /* Puedes dejar esto vacío por ahora, Tailwind hará el trabajo */
</style>