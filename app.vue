<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useSectionNav } from "~/composables/useSectionNav";
import { useReducedMotion } from "~/composables/useReducedMotion";
import { useColorMode, useMounted } from "@vueuse/core";

// Defined at module scope so each palette is a stable object reference.
// PrismaticBurst watches `props.colors` with reference equality (===),
// so returning the same constant prevents a GPU texture re-upload on every
// navigation between slides that share the same palette.
const PRISMATIC_WORK = ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'];
const PRISMATIC_DARK = ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'];
const PRISMATIC_LIGHT = ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'];

const TOTAL = 3;
const root = ref<HTMLElement | null>(null);
const { currentIndex, setIndex, onTouchStart, onTouchEnd } = useSectionNav(
    TOTAL,
    root,
);
const reduced = useReducedMotion();

const isMounted = useMounted();
const colorMode = useColorMode();
const isDarkMode = computed(
    () => isMounted.value && colorMode.value === "dark",
);

// Each section owns its own scroll surface internally (so the section's
// footer can stay pinned). Switching sections fully unmounts the previous
// one via `v-if`, so the new section starts at scrollTop 0 naturally.

// Combine global dark mode with section-specific dark mode (index 2 is "Work")

function toggleTheme() {
    colorMode.value = colorMode.value === "dark" ? "light" : "dark";
}

// Stable computed refs so PrismaticBurst doesn't see a new array reference
// on every render (which would reset its animation between slides).
const prismaticColors = computed(() => {
    if (currentIndex.value === 2) return PRISMATIC_WORK;
    if (isDarkMode.value) return PRISMATIC_DARK;
    return PRISMATIC_LIGHT;
});
const prismaticBlend = computed(() =>
    currentIndex.value === 2 || isDarkMode.value ? 'screen' : 'color',
);

// Page reveal: wait for fonts + canvas components before fading in
const isReady = ref(false);
onMounted(async () => {
    await document.fonts.ready;
    // Give PrismaticBurst and Grainient time to initialise their canvas frames
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    isReady.value = true;
});

// JSON-LD Person schema for richer search results
useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "William Manzoli",
                url: "https://www.manzoli.dev",
                jobTitle: "Senior Frontend Engineer",
                email: "mailto:william.manzoli@gmail.com",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: "São Paulo",
                    addressRegion: "SP",
                    addressCountry: "BR",
                },
                sameAs: [
                    "https://github.com/manzoliw",
                    "https://www.linkedin.com/in/manzoliw/",
                    "https://x.com/manzoliw",
                ],
            }),
        },
    ],
});
</script>

<template>
    <!-- Page-reveal overlay: same bg as the page, fades out once everything is ready -->
    <Transition name="page-reveal">
        <div
            v-if="!isReady"
            aria-hidden="true"
            class="fixed inset-0 z-[9999] bg-page dark:bg-ink pointer-events-none"
        />
    </Transition>
    <div
        class="h-svh w-svw p-3 sm:p-5 md:p-7 lg:p-8 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 transition-all duration-500 relative overflow-hidden text-ink dark:text-white"
        :class="[
            currentIndex === 2 ? 'dark bg-ink' : 'bg-page dark:bg-ink'
        ]"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
    >
        <!-- Background Grainient -->
        <ClientOnly>
            <div
                v-if="!reduced"
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 z-0 opacity-30"
            >
                <Grainient
                    :color1="(isDarkMode || currentIndex === 2) ? THEME.palettes.grainient.dark.color1 : THEME.palettes.grainient.light.color1"
                    :color2="(isDarkMode || currentIndex === 2) ? THEME.palettes.grainient.dark.color2 : THEME.palettes.grainient.light.color2"
                    :color3="(isDarkMode || currentIndex === 2) ? THEME.palettes.grainient.dark.color3 : THEME.palettes.grainient.light.color3"
                    :speed="0.15"
                    :warp-strength="2.5"
                    :warp-amplitude="2.0"
                    :grain-amount="0.04"
                />
            </div>
            <div
                v-else
                class="absolute inset-0 z-0 transition-colors duration-500 bg-page dark:bg-ink"
            />
        </ClientOnly>

        <!-- Theme Toggle Button -->
        <button
            type="button"
            class="fixed top-4 right-4 z-50 p-2 rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 flex items-center gap-2 px-3 bg-ink/5 dark:bg-white/10 text-ink dark:text-white border-ink/10 dark:border-white/20"
            :class="currentIndex === 2 ? '!bg-white/10 !text-white !border-white/20' : ''"
            @click="toggleTheme"
        >
            <div class="relative w-4 h-4">
                <Transition name="fade">
                    <svg
                        v-if="isDarkMode"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-4 h-4 absolute inset-0"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-4 h-4 absolute inset-0"
                    >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                </Transition>
            </div>
        </button>

        <!-- Roman numerals isolated outside the card so they can never
             overlap section content. Above the card on mobile, to the right
             on desktop. -->
        <NavPagination
            class="md:order-last relative z-10"
            :class="currentIndex === 2 ? '!text-white' : ''"
            :total="TOTAL"
            :current="currentIndex"
            :labels="['About', 'Stack', 'Work']"
            @select="setIndex"
        />
        <main
            ref="root"
            class="relative z-10 w-full md:h-full max-w-2xl md:max-w-3xl flex-1 min-h-0 overflow-hidden rounded-2xl border transition-all duration-500 shadow-[0_30px_60px_-30px_rgba(26,22,18,0.25)] backdrop-blur-sm bg-paper/90 dark:bg-[#1a1612]/90 text-ink dark:text-white border-ink/15 dark:border-white/15"
            :class="currentIndex === 2 ? 'dark !bg-teal/10 !border-white/15 !text-white' : ' dark:bg-teal/10 '"
        >
            <h1 class="sr-only">William Manzoli — Senior Frontend Engineer</h1>
            <!-- PrismaticBurst backdrop: full card at every viewport. -->
            <ClientOnly>
                <div
                    v-if="!reduced"
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-0"
                >
                    <PrismaticBurst
                        :intensity="1"
                        :distort="4.0"
                        :speed="0.04"
                        :ray-count="3"
                        :colors="prismaticColors"
                        :mix-blend-mode="prismaticBlend"
                    />
                </div>
            </ClientOnly>

            <section class="relative z-10 h-full w-full">
                <div
                    class="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center h-full w-full"
                >
                    <Transition name="slide" mode="out-in">
                        <div
                            :key="currentIndex"
                            class="flex flex-col h-full w-full max-w-2xl mx-auto"
                        >
                            <SectionAbout v-if="currentIndex === 0" />
                            <SectionStack v-else-if="currentIndex === 1" />
                            <SectionWork v-else-if="currentIndex === 2" />
                        </div>
                    </Transition>
                </div>
            </section>
        </main>
    </div>
</template>

<style>
/* Sequenced fade: on leave, LogoLoop fades first (0-150ms), then content
   (150-350ms). On enter, content fades in first (0-200ms), then LogoLoop
   (200-350ms). Transform is in sync; .no-slide counter-translates so the
   loop stays at viewport x=0 while the surrounding content slides. */
.slide-enter-active {
    transition:
        opacity 0.2s ease,
        transform 0.35s ease;
}
.slide-leave-active {
    transition:
        opacity 0.2s ease 0.15s,
        transform 0.35s ease;
}
.slide-enter-from {
    opacity: 0;
    transform: translateX(40px);
}
.slide-leave-to {
    opacity: 0;
    transform: translateX(-40px);
}

.slide-enter-active .no-slide {
    transition:
        transform 0.35s ease,
        opacity 0.15s ease 0.2s;
}
.slide-leave-active .no-slide {
    transition:
        transform 0.35s ease,
        opacity 0.15s ease;
}
.slide-enter-from .no-slide {
    transform: translateX(-40px);
    opacity: 0;
}
.slide-leave-to .no-slide {
    transform: translateX(40px);
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.page-reveal-leave-active {
    transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-reveal-leave-to {
    opacity: 0;
}
</style>
