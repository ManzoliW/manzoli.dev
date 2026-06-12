<script setup lang="ts">
import { computed } from "vue";
import { useGithub } from "~/composables/useGithubRepos";

const { data, pending } = useGithub();
const repos = computed(() => data.value?.repos ?? []);
const stats = computed(() => data.value?.stats);
const stackLogos = stack.map((s) => ({ src: s.src, alt: s.alt }));
</script>

<template>
    <div class="flex flex-col h-full gap-5">
        <SectionEyebrow label="OPEN SOURCE" />
        <SectionTitle text="Built in public." split-by="words" />

        <p
            v-if="stats && stats.joinedYear"
            class="font-mono text-[11px] tracking-[0.18em] uppercase opacity-60 flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
            <span class="tabular-nums">★ {{ stats.totalStars }} stars</span>
            <span aria-hidden="true" class="opacity-40">·</span>
            <span class="tabular-nums">{{ stats.publicRepos }} repos</span>
            <span aria-hidden="true" class="opacity-40">·</span>
            <span class="tabular-nums">{{ stats.followers }} followers</span>
            <span aria-hidden="true" class="opacity-40">·</span>
            <span>since {{ stats.joinedYear }}</span>
        </p>

        <p
            class="font-sans text-[14px] leading-relaxed text-ink/70 dark:text-paper/70 max-w-[44ch]"
        >
            Public repos
            <a
                :href="contacts.github"
                target="_blank"
                rel="noreferrer"
                class="underline underline-offset-4 hover:no-underline"
                >@{{ contacts.github.split("/").pop() }}</a
            >
            has committed to, sorted by stars. Pulled live from the GitHub API,
            cached hourly.
        </p>

        <!-- Scrollable middle: the STACK logo loop below stays pinned. -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <ul
            v-if="repos && repos.length"
            class="space-y-2 max-w-[52ch]"
        >
            <li v-for="r in repos" :key="r.name">
                <a
                    :href="r.url"
                    target="_blank"
                    rel="noreferrer"
                    class="group block border-b border-ink/10 dark:border-paper/10 py-2 last:border-b-0 hover:border-ink/40 dark:hover:border-paper/40 transition-colors"
                >
                    <div class="flex items-center gap-2.5">
                        <img
                            v-if="r.ownerAvatar"
                            :src="r.ownerAvatar"
                            :alt="r.owner"
                            width="40"
                            height="40"
                            :class="[
                                'w-10 h-10 shrink-0 border border-ink/15 dark:border-paper/15 object-cover',
                                r.ownerType === 'Organization'
                                    ? 'rounded-sm'
                                    : 'rounded-full',
                            ]"
                            loading="lazy"
                            decoding="async"
                        >
                        <span
                            class="font-mono text-[12px] tracking-[0.02em] text-ink dark:text-paper group-hover:underline underline-offset-4 truncate"
                        >
                            {{ r.name }}
                        </span>
                        <span
                            class="ml-auto font-mono text-[10px] text-ink/45 dark:text-paper/45 shrink-0 tabular-nums"
                        >
                            ★ {{ r.stars
                            }}<span v-if="r.language"> · {{ r.language }}</span>
                        </span>
                    </div>
                    <p
                        v-if="r.description"
                        class="font-sans text-[12px] text-ink/65 dark:text-paper/65 leading-snug mt-0.5 line-clamp-1"
                    >
                        {{ r.description }}
                    </p>
                </a>
            </li>
        </ul>

        <p v-else-if="pending" class="font-mono text-[11px] opacity-50">
            Loading repos…
        </p>

        <p v-else class="font-mono text-[11px] opacity-50">
            Couldn't reach GitHub.
            <a
                :href="contacts.github"
                target="_blank"
                rel="noreferrer"
                class="underline underline-offset-4"
                >Open the profile →</a
            >
        </p>
        </div>

        <!-- Footer: always visible (does not scroll with the middle). -->
        <div class="-mx-2 pt-1 border-t border-ink/10 dark:border-paper/10">
            <p
                class="font-mono text-[10px] tracking-[0.32em] uppercase opacity-55 px-2 pt-3 pb-2"
            >
                STACK
            </p>
            <div class="no-slide grayscale opacity-40" aria-hidden="true">
            <ClientOnly>
                <LogoLoop
                    :logos="stackLogos"
                    :speed="55"
                    :gap="40"
                    :logo-height="40"
                    fade-out
                    scale-on-hover
                />
                <template #fallback>
                    <div
                        class="flex flex-wrap gap-6 items-center"
                        style="opacity: 0; height: 40px"
                    >
                        <img
                            v-for="logo in stackLogos"
                            :key="logo.src"
                            :src="logo.src"
                            :alt="logo.alt"
                            height="40"
                            style="height: 40px; width: auto"
                        >
                    </div>
                </template>
            </ClientOnly>
            </div>
        </div>
    </div>
</template>
