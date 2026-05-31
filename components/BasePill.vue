<script setup lang="ts">
withDefaults(
  defineProps<{
    href: string
    target?: '_blank' | '_self'
    tone?: 'ink' | 'paper'
  }>(),
  { target: '_self', tone: 'ink' },
)
</script>

<template>
  <a
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noreferrer' : undefined"
    :class="[
      'inline-flex items-center justify-center min-h-[44px] py-3 px-6 rounded-full border font-mono text-[11px] tracking-[0.22em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      tone === 'paper'
        ? 'border-paper/40 hover:bg-paper hover:text-ink focus-visible:outline-paper'
        : 'border-ink/40 hover:bg-ink hover:text-paper focus-visible:outline-ink',
    ]"
  >
    <slot />
  </a>
</template>
