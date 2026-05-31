<script setup lang="ts">
import { useReducedMotion } from "~/composables/useReducedMotion";

const props = defineProps<{ error: { statusCode: number; message?: string } }>();
const reduced = useReducedMotion();

const title = props.error.statusCode === 404
    ? "Page not found"
    : "Something went wrong";

const subtitle = props.error.statusCode === 404
    ? "The page you're looking for doesn't exist — or was moved."
    : props.error.message || "An unexpected error occurred.";

const handleClearError = () => clearError({ redirect: "/" });

useHead({
    title: `${props.error.statusCode} — ${title} | manzoli.dev`,
});
</script>

<template>
    <div
        class="h-svh w-svw flex items-center justify-center p-6 sm:p-8 bg-page text-ink relative overflow-hidden"
    >
        <!-- Background Grainient -->
        <ClientOnly>
            <div
                v-if="!reduced"
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 z-0 opacity-30"
            >
                <Grainient
                    color1="#d1e9ff"
                    color2="#ffd6e8"
                    color3="#d1fff0"
                    :speed="0.15"
                    :warp-strength="2.5"
                    :warp-amplitude="2.0"
                    :grain-amount="0.04"
                />
            </div>
        </ClientOnly>

        <div class="relative z-10 text-center max-w-md mx-auto">
            <!-- Error code -->
            <p
                class="font-serif text-[120px] sm:text-[160px] font-medium leading-none tracking-[-0.04em] text-ink/10"
            >
                {{ error.statusCode }}
            </p>

            <!-- Title -->
            <h1
                class="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight leading-[1.05] -mt-4 sm:-mt-6"
            >
                {{ title }}
            </h1>

            <!-- Subtitle -->
            <p
                class="mt-4 font-sans text-sm sm:text-base text-ink/65 leading-relaxed max-w-[38ch] mx-auto"
            >
                {{ subtitle }}
            </p>

            <!-- CTA -->
            <button
                type="button"
                class="mt-8 inline-flex items-center justify-center min-h-[44px] py-3 px-6 rounded-full border border-ink/40 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                @click="handleClearError"
            >
                Go home
            </button>
        </div>
    </div>
</template>
