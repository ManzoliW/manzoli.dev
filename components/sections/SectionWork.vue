<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useReducedMotion } from "~/composables/useReducedMotion";

const jobs = experience;
const refs = references;
const companyLogos = companies.map((c) => ({
    src: c.src,
    alt: c.alt,
    href: c.href,
}));

const reduced = useReducedMotion();
const refIndex = ref(0);
const refPaused = ref(false);
const currentRef = computed(() => refs[refIndex.value]);

const ROTATE_MS = 8000;
let rotateTimer: ReturnType<typeof setInterval> | null = null;

const advance = (delta: number) => {
    if (!refs.length) return;
    refIndex.value = (refIndex.value + delta + refs.length) % refs.length;
};

onMounted(() => {
    if (reduced.value || refs.length < 2) return;
    rotateTimer = setInterval(() => {
        if (!refPaused.value) advance(1);
    }, ROTATE_MS);
});

onBeforeUnmount(() => {
    if (rotateTimer) clearInterval(rotateTimer);
    rotateTimer = null;
});
</script>

<template>
    <div class="flex flex-col h-full gap-5">
        <SectionEyebrow label="BUSINESS" />
        <SectionTitle
            text="Shipping for teams that ship a lot."
            split-by="words"
        />

        <!-- Scrollable middle: experience list + WORDS testimonials.
             The TRUSTED BY logo loop below stays pinned as the footer.
             overflow-x-hidden prevents the spec-mandated auto-promotion of
             overflow-x to `auto` when overflow-y is `auto`. -->
        <div
            class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden justify-between flex flex-col gap-5"
        >
            <ol class="space-y-4 max-w-[52ch]">
                <li
                    v-for="job in jobs"
                    :key="job.company"
                    class="grid grid-cols-[78px_1fr] gap-4 items-baseline"
                >
                    <span
                        class="font-mono text-[10px] tracking-[0.18em] uppercase text-ink/45 dark:text-paper/55 pt-1 shrink-0 tabular-nums"
                    >
                        {{ job.from }} — {{ job.to }}
                    </span>
                    <div>
                        <div
                            class="font-serif text-base md:text-lg leading-tight"
                        >
                            <a
                                v-if="job.href"
                                :href="job.href"
                                target="_blank"
                                rel="noreferrer"
                                class="hover:underline underline-offset-4"
                            >
                                {{ job.company }}
                            </a>
                            <template v-else>{{ job.company }}</template>
                            <span
                                class="font-sans text-[12px] text-ink/55 dark:text-paper/55"
                            >
                                · {{ job.role }}</span
                            >
                        </div>
                        <p
                            class="font-sans text-[13px] text-ink/70 dark:text-paper/75 leading-snug mt-1"
                        >
                            {{ job.blurb }}
                        </p>
                        <dl
                            v-if="job.metrics && job.metrics.length"
                            class="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.06em] uppercase text-ink/55 dark:text-paper/60"
                        >
                            <div
                                v-for="m in job.metrics"
                                :key="m.label"
                                class="flex items-baseline gap-1.5"
                            >
                                <dt class="opacity-75">{{ m.label }}</dt>
                                <dd
                                    class="tabular-nums text-ink dark:text-paper"
                                >
                                    {{ m.value }}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </li>
            </ol>

            <!-- References: one quietly-rotating quote at a time, with manual nav. -->
            <div
                v-if="refs.length"
                class="-mx-2 pt-1 border-t border-ink/10 dark:border-paper/15"
                @mouseenter="refPaused = true"
                @mouseleave="refPaused = false"
            >
                <div
                    class="flex items-center justify-between px-2 pt-3 pb-2 gap-4"
                >
                    <p
                        class="font-mono text-[10px] tracking-[0.32em] uppercase opacity-55"
                    >
                        WORDS
                    </p>
                    <div
                        v-if="refs.length > 1"
                        class="flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] opacity-60"
                    >
                        <button
                            type="button"
                            class="inline-flex items-center justify-center w-8 h-8 hover:opacity-100 hover:bg-ink/5 dark:hover:bg-paper/10 opacity-70 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded-full"
                            :aria-label="`Previous testimonial`"
                            @click="advance(-1)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <span class="tabular-nums px-1">
                            {{ refIndex + 1 }} / {{ refs.length }}
                        </span>
                        <button
                            type="button"
                            class="inline-flex items-center justify-center w-8 h-8 hover:opacity-100 hover:bg-ink/5 dark:hover:bg-paper/10 opacity-70 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded-full"
                            :aria-label="`Next testimonial`"
                            @click="advance(1)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>
                <!-- Stable slot height so the block doesn't bounce between quotes. -->
                <div class="relative min-h-[7rem] md:min-h-[6.5rem]" aria-live="polite" aria-atomic="true">
                    <Transition name="ref-fade">
                        <div
                            v-if="currentRef"
                            :key="currentRef.name"
                            class="absolute inset-0 flex gap-3 items-start px-2"
                        >
                            <div class="min-w-0">
                                <p
                                    class="font-serif italic text-[13px] leading-snug text-ink/80 dark:text-paper/85 line-clamp-4 md:line-clamp-none"
                                >
                                    &ldquo;{{ currentRef.text }}&rdquo;
                                </p>
                                <p
                                    class="mt-1 font-mono text-[10px] tracking-[0.08em] uppercase opacity-55 truncate"
                                >
                                    {{ currentRef.name }} ·
                                    {{ currentRef.role }}
                                </p>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
        <!-- Footer: always visible (does not scroll with the middle). -->
        <div class="-mx-2 pt-1 border-t border-ink/10 dark:border-paper/15">
            <div class="flex items-center justify-between px-2 pt-3 pb-2 gap-4">
                <p
                    class="font-mono text-[10px] tracking-[0.32em] uppercase opacity-55"
                >
                    TRUSTED BY
                </p>
            </div>
            <div class="no-slide grayscale opacity-40" aria-hidden="true">
                <ClientOnly>
                    <LogoLoop
                        :logos="companyLogos"
                        :speed="35"
                        :gap="72"
                        :logo-height="40"
                        pause-on-hover
                        fade-out
                        scale-on-hover
                    />
                    <template #fallback>
                        <div
                            class="flex flex-wrap gap-8 items-center"
                            style="opacity: 0; height: 40px"
                        >
                            <a
                                v-for="c in companyLogos"
                                :key="c.src"
                                :href="c.href"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    :src="c.src"
                                    :alt="c.alt"
                                    style="height: 40px; width: auto"
                                >
                            </a>
                        </div>
                    </template>
                </ClientOnly>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ref-fade-enter-active,
.ref-fade-leave-active {
    transition: opacity 0.35s ease;
}
.ref-fade-enter-from,
.ref-fade-leave-to {
    opacity: 0;
}
</style>
