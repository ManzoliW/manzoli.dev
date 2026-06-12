<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, ref } from "vue";
import { useReducedMotion } from "~/composables/useReducedMotion";

const reduced = useReducedMotion();

const openLink = (url: string) => {
    if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
    }
};
const openEmail = () => {
    if (typeof window !== "undefined") {
        window.location.href = `mailto:${contacts.email}`;
    }
};

// All stickers are positioned as offsets from the avatar's character
// visual center — which lands exactly on the container's horizontal
// centerline. This guarantees the composition reads as centered at every
// scale and aspect ratio.
const stickerContainerRef = ref<HTMLElement | null>(null);
const { width: containerW, height: containerH } =
    useElementSize(stickerContainerRef);

const REFERENCE_W = 360;
const REFERENCE_H = 530;


const layout = computed(() => {
    const w = containerW.value;
    const h = containerH.value;
    const sW = w ? w / REFERENCE_W : 1;
    const sH = h ? h / REFERENCE_H : 1;
    const s = Math.min(sW, sH);
    const cx = w ? w / 2 : REFERENCE_W / 2;

    // Each sticker's x is expressed as `cx + offset * s`, where offset is
    // measured from the container's centerline. The avatar's row centers,
    // social row, and edu row are all symmetric around cx by construction.

    // Social row: 4 stickers in a gentle arc — outer stickers sit higher
    // for a natural fan/spread composition (like stickers on a laptop lid).
    const arcLift = 12 * s; // how much higher outer stickers sit

    const isMobile = w < 480;
    const avatarWidth = isMobile ? 550 * s : 580 * s;
    const avatarCenterX = isMobile ? 280 * s : 300 * s;

    return {
        container: "",
        me: {
            width: avatarWidth,
            x: cx - avatarCenterX,
            y: 10 * s,
            rotate: 0,
        },
        // Social row: arc layout with tighter spacing for slight overlap (~5px)
        email: { width: 130 * s, x: cx - 220 * s, y: 380 * s - arcLift, rotate: -14 },
        linkedin: { width: 130 * s, x: cx - 120 * s, y: 370 * s, rotate: 6 },
        github: { width: 130 * s, x: cx - 20 * s, y: 370 * s, rotate: -8 },
        x: { width: 130 * s, x: cx + 72 * s, y: 380 * s - arcLift, rotate: 10 },
        // Edu row: bumped from 50→60 for better legibility, tighter spacing
        fmu: { width: 60 * s, x: cx - 95 * s, y: 405 * s, rotate: 10 },
        fiap: { width: 60 * s, x: cx - 42 * s, y: 418 * s, rotate: 4 },
        anthropic: { width: 60 * s, x: cx + 8 * s, y: 418 * s, rotate: -4 },
        neo4j: { width: 60 * s, x: cx + 55 * s, y: 405 * s, rotate: -10 },
    };
});
</script>

<template>
    <div class="flex flex-col h-full w-full">
        <!-- TOP: title + subtitle -->
        <header class="text-center">
            <ClientOnly>
                <SplitText
                    v-if="!reduced"
                    :text="me.name.toUpperCase()"
                    tag="h2"
                    class-name="font-serif font-medium text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em] leading-[0.95]"
                    text-align="center"
                    split-type="chars"
                    :delay="22"
                    :duration="0.9"
                />
                <h2
                    v-else
                    class="font-serif font-medium text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em] leading-[0.95]"
                >
                    {{ me.name.toUpperCase() }}
                </h2>
                <template #fallback>
                    <h2
                        class="font-serif font-medium text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em] leading-[0.95]"
                        style="opacity: 0"
                    >
                        {{ me.name.toUpperCase() }}
                    </h2>
                </template>
            </ClientOnly>
            <p
                class="font-mono text-[10px] md:text-xs tracking-[0.32em] uppercase mt-3 md:mt-6 opacity-70 dark:opacity-80"
            >
                {{ me.role }}
            </p>
            <p
                class="mt-2 md:mt-3 font-mono text-[10px] md:text-[11px] tracking-[0.14em] opacity-70 dark:opacity-80"
            >
                <a
                    :href="`mailto:${contacts.email}`"
                    class="underline underline-offset-4 hover:no-underline"
                >
                    {{ contacts.email }}
                </a>
                <span aria-hidden="true" class="mx-2 opacity-40">·</span>
                <a
                    :href="contacts.linkedin"
                    target="_blank"
                    rel="noreferrer"
                    class="underline underline-offset-4 hover:no-underline"
                >
                    LinkedIn
                </a>
            </p>
        </header>

        <!-- MIDDLE: stickers -->
        <div class="flex-1 flex items-center justify-center min-h-0 py-4">
            <ClientOnly>
                <div
                    v-if="!reduced"
                    ref="stickerContainerRef"
                    :class="[
                        'relative w-full h-full mx-auto select-none',
                        layout.container,
                    ]"
                    :style="{ maxWidth: 'clamp(280px, 60vw, 520px)' }"
                >
                    <!-- Avatar — no peel, enters first -->
                    <StickerPeel
                        image-src="/stickers/me.png"
                        :width="layout.me.width"
                        :rotate="layout.me.rotate"
                        :initial-position="{
                            x: layout.me.x,
                            y: layout.me.y,
                        }"
                        :shadow-intensity="0"
                        :lighting-intensity="0.2"
                        :entrance-delay="0"
                        aria-label="William Manzoli"
                        role="img"
                        fetchpriority="high"
                        loading="eager"
                    />

                    <!-- Social row — enters third (staggered 360–540ms) -->
                    <StickerPeel
                        image-src="/stickers/email.svg"
                        :width="layout.email.width"
                        :rotate="layout.email.rotate"
                        :initial-position="{
                            x: layout.email.x,
                            y: layout.email.y,
                        }"
                        :shadow-intensity="0"
                        :lighting-intensity="0.2"
                        :entrance-delay="360"
                        back-color="#e8e4dc"
                        role="button"
                        :tabindex="0"
                        aria-label="Send an email"
                        class="cursor-pointer"
                        @click="openEmail"
                        @keydown.enter="openEmail"
                        @keydown.space.prevent="openEmail"
                    />
                    <StickerPeel
                        image-src="/stickers/x.svg"
                        :width="layout.x.width"
                        :rotate="layout.x.rotate"
                        :initial-position="{
                            x: layout.x.x,
                            y: layout.x.y,
                        }"
                        :shadow-intensity="0"
                        :lighting-intensity="0.2"
                        :entrance-delay="420"
                        back-color="#e8e4dc"
                        role="button"
                        :tabindex="0"
                        aria-label="Open X profile"
                        class="cursor-pointer"
                        @click="openLink(contacts.x)"
                        @keydown.enter="openLink(contacts.x)"
                        @keydown.space.prevent="openLink(contacts.x)"
                    />
                    <StickerPeel
                        image-src="/stickers/github.svg"
                        :width="layout.github.width"
                        :rotate="layout.github.rotate"
                        :initial-position="{
                            x: layout.github.x,
                            y: layout.github.y,
                        }"
                        :shadow-intensity="0"
                        :lighting-intensity="0.2"
                        :entrance-delay="540"
                        back-color="#e8e4dc"
                        role="button"
                        :tabindex="0"
                        aria-label="Open GitHub profile"
                        class="cursor-pointer"
                        @click="openLink(contacts.github)"
                        @keydown.enter="openLink(contacts.github)"
                        @keydown.space.prevent="openLink(contacts.github)"
                    />
                    <StickerPeel
                        image-src="/stickers/linkedin.svg"
                        :width="layout.linkedin.width"
                        :rotate="layout.linkedin.rotate"
                        :initial-position="{
                            x: layout.linkedin.x,
                            y: layout.linkedin.y,
                        }"
                        :shadow-intensity="0"
                        :lighting-intensity="0.2"
                        :entrance-delay="480"
                        back-color="#e8e4dc"
                        role="button"
                        :tabindex="0"
                        aria-label="Open LinkedIn profile"
                        class="cursor-pointer"
                        @click="openLink(contacts.linkedin)"
                        @keydown.enter="openLink(contacts.linkedin)"
                        @keydown.space.prevent="openLink(contacts.linkedin)"
                    />
                </div>
                <ul
                    v-else
                    class="flex flex-col gap-3 font-mono text-[11px] tracking-[0.22em] uppercase items-center"
                >
                    <li>
                        <a
                            :href="`mailto:${contacts.email}`"
                            class="underline underline-offset-4 hover:no-underline"
                            >Email →</a
                        >
                    </li>
                    <li>
                        <a
                            :href="contacts.linkedin"
                            target="_blank"
                            rel="noreferrer"
                            class="underline underline-offset-4 hover:no-underline"
                            >LinkedIn →</a
                        >
                    </li>
                    <li>
                        <a
                            :href="contacts.github"
                            target="_blank"
                            rel="noreferrer"
                            class="underline underline-offset-4 hover:no-underline"
                            >GitHub →</a
                        >
                    </li>
                    <li>
                        <a
                            :href="contacts.x"
                            target="_blank"
                            rel="noreferrer"
                            class="underline underline-offset-4 hover:no-underline"
                            >X →</a
                        >
                    </li>
                </ul>
                <template #fallback>
                    <div :class="layout.container" style="opacity: 0" />
                </template>
            </ClientOnly>
        </div>

        <!-- Footer: always visible (does not scroll with the middle). -->
        <div class="-mx-2 pt-1 border-t border-ink/10 dark:border-paper/15">
            <div class="flex items-center justify-between px-2 pt-3 pb-2 gap-4">
                <p
                    class="font-mono text-[10px] tracking-[0.32em] uppercase opacity-55"
                >
                    EDUCATION &amp; CERTIFICATIONS
                </p>
            </div>
            <div class="no-slide grayscale opacity-40 dark:invert" aria-hidden="true">
                <ClientOnly>
                    <LogoLoop
                        :logos="educationLogos"
                        :speed="45"
                        :gap="64"
                        :logo-height="36"
                        pause-on-hover
                        fade-out
                        scale-on-hover
                    />
                    <template #fallback>
                        <div
                            class="flex flex-wrap gap-8 items-center"
                            style="opacity: 0; height: 36px"
                        >
                            <img
                                v-for="logo in educationLogos"
                                :key="logo.src"
                                :src="logo.src"
                                :alt="logo.alt"
                                style="height: 36px; width: auto"
                            >
                        </div>
                    </template>
                </ClientOnly>
            </div>
        </div>
    </div>
</template>
