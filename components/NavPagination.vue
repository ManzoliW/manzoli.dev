<script setup lang="ts">
const props = defineProps<{ 
    total: number; 
    current: number;
    labels?: string[];
}>();
defineEmits<{ select: [index: number] }>();

function getAriaLabel(i: number): string {
    if (props.labels && props.labels[i - 1]) {
        return `Go to ${props.labels[i - 1]} section`;
    }
    return `Go to section ${i}`;
}

function toRoman(n: number): string {
    const map: Array<[number, string]> = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
    ];
    let out = "";
    for (const [v, s] of map) {
        while (n >= v) {
            out += s;
            n -= v;
        }
    }
    return out;
}
</script>

<template>
    <ol
        class="font-mono flex shrink-0
               flex-row gap-2 text-base
               md:flex-col md:gap-1 md:text-2xl"
    >
        <li v-for="i in props.total" :key="i">
            <button
                type="button"
                :aria-current="i - 1 === props.current ? 'true' : 'false'"
                :aria-label="getAriaLabel(i)"
                class="flex items-center justify-center text-center w-full min-w-11 h-11 md:min-w-9 md:h-9 px-1 tabular-nums transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded"
                :class="
                    i - 1 === props.current
                        ? 'opacity-100 text-[16px] md:text-[18px]'
                        : 'opacity-25 hover:opacity-60 text-[10px]'
                "
                @click="$emit('select', i - 1)"
            >
                {{ toRoman(i) }}
            </button>
        </li>
    </ol>
</template>
