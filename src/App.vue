<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
// App.vue — root entry, router-view handles all layout switching
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

:root {
  --primary:        #4F46E5;
  --primary-light:  #EEF2FF;
  --primary-dark:   #3730A3;
  --success:        #10B981;
  --success-light:  #D1FAE5;
  --warning:        #F59E0B;
  --warning-light:  #FEF3C7;
  --danger:         #EF4444;
  --danger-light:   #FEE2E2;
  --info:           #06B6D4;
  --info-light:     #CFFAFE;
  --gray-50:        #F9FAFB;
  --gray-100:       #F3F4F6;
  --gray-200:       #E5E7EB;
  --gray-300:       #D1D5DB;
  --gray-400:       #9CA3AF;
  --gray-500:       #6B7280;
  --gray-600:       #4B5563;
  --gray-700:       #374151;
  --gray-800:       #1F2937;
  --gray-900:       #111827;
  --sidebar-width:  260px;
  --header-height:  60px;
  --bottom-nav:     64px;
  --radius-sm:      6px;
  --radius-md:      10px;
  --radius-lg:      16px;
  --radius-xl:      24px;
  --shadow-sm:      0 1px 2px 0 rgba(0,0,0,.05);
  --shadow-md:      0 4px 6px -1px rgba(0,0,0,.08),0 2px 4px -2px rgba(0,0,0,.05);
  --shadow-lg:      0 10px 15px -3px rgba(0,0,0,.08),0 4px 6px -4px rgba(0,0,0,.05);
  --shadow-xl:      0 20px 25px -5px rgba(0,0,0,.10),0 8px 10px -6px rgba(0,0,0,.05);
}

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  color: var(--gray-800);
  background: var(--gray-50);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

/* prevent iOS input zoom */
input, select, textarea, button { font-family: inherit; font-size: 16px; }

a { color: inherit; text-decoration: none; }

/* route transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all .22s ease; }
.slide-up-enter-from   { transform: translateY(12px); opacity: 0; }
.slide-up-leave-to     { transform: translateY(-8px);  opacity: 0; }

/* scrollbar */
::-webkit-scrollbar       { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 99px; }

/* bootstrap overrides */
.btn { font-family: 'DM Sans', sans-serif; font-weight: 500; letter-spacing: -.01em; }
.btn-primary   { background: var(--primary);   border-color: var(--primary);   }
.btn-primary:hover { background: var(--primary-dark); border-color: var(--primary-dark); }
.form-control, .form-select {
  border-color: var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: none !important;
  transition: border-color .15s;
}
.form-control:focus, .form-select:focus { border-color: var(--primary); }
.card { border-color: var(--gray-200); border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm); }
.badge { font-weight: 500; letter-spacing: .01em; }
.modal-content { border-radius: var(--radius-xl) !important; border: none; box-shadow: var(--shadow-xl); }
.modal-header  { border-bottom: 1px solid var(--gray-100); padding: 1.25rem 1.5rem; }
.modal-footer  { border-top: 1px solid var(--gray-100); padding: 1rem 1.5rem; }
.table { font-size: 14px; }
.table th { font-weight: 600; color: var(--gray-500); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
.table td { vertical-align: middle; }
.table > :not(caption) > * > * { padding: .875rem 1rem; }
.dropdown-menu { border-radius: var(--radius-md); border-color: var(--gray-200); box-shadow: var(--shadow-lg); padding: .5rem; }
.dropdown-item { border-radius: var(--radius-sm); font-size: 14px; padding: .5rem .75rem; }
</style>