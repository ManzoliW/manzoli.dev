<script setup lang="ts">
import { useReducedMotion } from "~/composables/useReducedMotion";

defineProps<{ text: string; splitBy?: "chars" | "words" }>();

const reduced = useReducedMotion();
</script>

<template>
    <ClientOnly>
        <h2
            v-if="reduced"
            class="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.05]"
        >
            {{ text }}
        </h2>
        <SplitText
            v-else
            :text="text"
            tag="h2"
            class-name="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.05] text-left"
            text-align="left"
            :split-type="splitBy ?? 'words'"
            :delay="splitBy === 'chars' ? 30 : 35"
            :duration="0.85"
        />
        <template #fallback>
            <h2
                class="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.05]"
                style="opacity: 0"
            >
                {{ text }}
            </h2>
        </template>
    </ClientOnly>
</template>
