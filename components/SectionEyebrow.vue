<script setup lang="ts">
defineProps<{ label: string; tone?: 'default' | 'coral' }>()
</script>

<template>
  <p
    class="font-mono text-[11px] tracking-[0.32em] uppercase"
    :class="tone === 'coral' ? 'text-coral' : 'opacity-55'"
  >
    {{ label }}
  </p>
</template>
