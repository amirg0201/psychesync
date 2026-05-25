<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
  
  <!-- Efectos decorativos de fondo -->
  <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none"></div>

  <!-- Header -->
  <header class="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-10">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
        PS
      </div>
      <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent">PsycheSync</span>
    </div>
    <a 
      href="/login" 
      class="px-5 py-2.5 bg-slate-900/60 backdrop-blur-md border border-slate-800/60 text-slate-200 hover:bg-slate-850 hover:text-indigo-400 text-xs font-bold rounded-xl transition shadow-md active:scale-95"
    >
      Acceso Profesional
    </a>
  </header>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center gap-12 relative z-10 flex-1 justify-center">
    
    <!-- Text Content -->
    <div class="flex-1 text-center lg:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
        <span class="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Prevención del Desgaste Profesional
      </div>
      
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-100">
        El guardián inteligente de tu <span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">salud mental</span>
      </h1>
      
      <p class="mt-6 text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
        PsycheSync es el primer motor de gestión clínica y análisis cognitivo reactivo diseñado por y para psicólogos independientes. Evalúa el impacto de cada consulta en tu energía y prevén el Burnout.
      </p>

      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
        <a 
          href="/login" 
          class="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 hover:brightness-110 transition-all active:scale-98 text-sm"
        >
          Iniciar Portal Clínico
        </a>
        <a 
          href="#features" 
          class="w-full sm:w-auto text-center px-8 py-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-slate-300 font-bold rounded-xl hover:bg-slate-800/60 hover:text-slate-100 transition-all active:scale-98 text-sm"
        >
          Conocer Más
        </a>
      </div>
    </div>

    <!-- Feature Preview / Graphic Card (Glassmorphism Mockup) -->
    <div class="flex-1 w-full max-w-md relative">
      <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-3xl filter blur-2xl pointer-events-none"></div>
      
      <div class="backdrop-blur-xl bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative">
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-1.5">
            <span class="w-3 h-3 rounded-full bg-rose-500/60"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500/60"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/60"></span>
          </div>
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Burnout Monitor v1.0</span>
        </div>

        <div class="space-y-4">
          <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            <div class="flex justify-between items-center text-[10px] text-slate-500 font-bold tracking-wide uppercase mb-1">
              <span>Carga Acumulada</span>
              <span class="text-emerald-400">Saludable</span>
            </div>
            <div class="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1.5">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 w-[42%]"></div>
            </div>
          </div>

          <div class="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/20 text-emerald-400">
            <div class="flex items-center gap-2 mb-1">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span class="text-xs font-bold uppercase tracking-wider">Estado: Nivel Óptimo</span>
            </div>
            <p class="text-[10px] text-emerald-300/80 leading-relaxed font-medium">
              "Tu balance cognitivo se encuentra estable. Sigue con tus pautas de salud actual."
            </p>
          </div>

          <div class="p-4 rounded-xl border bg-slate-950/30 border-slate-800/60 text-slate-400">
            <div class="flex items-center justify-between text-xs mb-2 text-slate-300 font-bold">
              <span>Fórmula de Productividad</span>
            </div>
            <div class="text-[10px] font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-850 text-slate-400">
              Puntaje = Prioridad - (Real - Esperada)
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Features Grid -->
  <section id="features" class="max-w-6xl mx-auto w-full px-6 py-12 relative z-10 border-t border-slate-900">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Feature 1 -->
      <div class="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition duration-300">
        <div class="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm mb-4">
          🧠
        </div>
        <h3 class="text-sm font-bold text-slate-200 tracking-tight">Motor de Burnout</h3>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
          Calcula automáticamente el impacto emocional y cognitivo de tus citas en base a prioridades e intensidades.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition duration-300">
        <div class="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm mb-4">
          🛡️
        </div>
        <h3 class="text-sm font-bold text-slate-200 tracking-tight">Seguridad y Respeto</h3>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
          Validación estricta de documentos en servidor, contraseñas irreversiblemente hasheadas y tokens cifrados.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition duration-300">
        <div class="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm mb-4">
          ⚡
        </div>
        <h3 class="text-sm font-bold text-slate-200 tracking-tight">Cero Inputs Manuales</h3>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
          Selección ágil de registros relacionales para que no tengas que digitar IDs complejos. Rapidez garantizada.
        </p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="max-w-6xl mx-auto w-full px-6 py-6 text-center text-[10px] text-slate-600 relative z-10 border-t border-slate-900">
    &copy; {new Date().getFullYear()} PsycheSync. Creado con Svelte 5, Hono y MongoDB para profesionales de la salud mental.
  </footer>
</div>