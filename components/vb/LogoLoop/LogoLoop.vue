<template>
    <div
        ref="containerRef"
        :class="rootClasses"
        :style="containerStyle"
        role="region"
        :aria-label="ariaLabel"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div
            ref="trackRef"
            :class="[
                'flex w-max will-change-transform select-none transition-opacity duration-500 ease-out',
                'motion-reduce:transform-none',
                isReady ? 'opacity-100' : 'opacity-0',
            ]"
        >
            <ul
                v-for="copyIndex in copyCount"
                :key="`copy-${copyIndex - 1}`"
                :ref="
                    (el) => {
                        if (copyIndex === 1) seqRef = el as HTMLUListElement;
                    }
                "
                class="flex items-center"
                role="list"
                :aria-hidden="copyIndex > 1"
            >
                <li
                    v-for="(item, itemIndex) in logos"
                    :key="`${copyIndex - 1}-${itemIndex}`"
                    :class="[
                        'flex-none mr-[var(--logoloop-gap)] text-[length:var(--logoloop-logoHeight)] leading-[1]',
                        scaleOnHover && 'overflow-visible group/item',
                    ]"
                    role="listitem"
                >
                    <a
                        v-if="item.href"
                        :class="[
                            'inline-flex items-center no-underline rounded',
                            'transition-opacity duration-200 ease-linear',
                            'hover:opacity-80',
                            'focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2',
                        ]"
                        :href="item.href"
                        :aria-label="getItemAriaLabel(item) || 'logo link'"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <LogoContent
                            :item="item"
                            :scale-on-hover="scaleOnHover"
                        />
                    </a>
                    <LogoContent
                        v-else
                        :item="item"
                        :scale-on-hover="scaleOnHover"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    useTemplateRef,
    watch, defineComponent, h 
} from "vue";

export type LogoItemNode = {
    node: string;
    href?: string;
    title?: string;
    ariaLabel?: string;
    style?: string | Record<string, any>;
};

export type LogoItemImage = {
    src: string;
    alt?: string;
    href?: string;
    title?: string;
    srcSet?: string;
    sizes?: string;
    width?: number | string;
    height?: number | string;
    style?: string | Record<string, any>;
};

export type LogoItem = LogoItemNode | LogoItemImage;

export interface LogoLoopProps {
    logos: LogoItem[];
    speed?: number;
    direction?: "left" | "right";
    width?: number | string;
    logoHeight?: number;
    gap?: number;
    pauseOnHover?: boolean;
    fadeOut?: boolean;
    scaleOnHover?: boolean;
    ariaLabel?: string;
    className?: string;
    style?: string | Record<string, any>;
}

const ANIMATION_CONFIG = {
    SMOOTH_TAU: 0.25,
    MIN_COPIES: 2,
    COPY_HEADROOM: 2,
} as const;

const props = withDefaults(defineProps<LogoLoopProps>(), {
    speed: 120,
    direction: "left",
    width: "100%",
    logoHeight: 60,
    gap: 32,
    pauseOnHover: true,
    fadeOut: false,
    scaleOnHover: false,
    ariaLabel: "Partner logos",
});

const containerRef = useTemplateRef("containerRef");
const trackRef = useTemplateRef("trackRef");
const seqRef = ref<HTMLUListElement | null>(null);

const seqWidth = ref<number>(0);
const copyCount = ref<number>(ANIMATION_CONFIG.MIN_COPIES);
const isHovered = ref<boolean>(false);
const isReady = ref<boolean>(false);

let rafRef: number | null = null;
let lastTimestampRef: number | null = null;
const offsetRef = ref(0);
const velocityRef = ref(0);

const targetVelocity = computed(() => {
    const magnitude = Math.abs(props.speed);
    const directionMultiplier = props.direction === "left" ? 1 : -1;
    const speedMultiplier = props.speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
});

const cssVariables = computed(() => ({
    "--logoloop-gap": `${props.gap}px`,
    "--logoloop-logoHeight": `${props.logoHeight}px`,
}));

const rootClasses = computed(() => {
    const classes = [
        "relative overflow-x-hidden group",
    ];

    if (props.scaleOnHover) {
        classes.push("py-[calc(var(--logoloop-logoHeight)*0.1)]");
    }

    if (props.className) {
        classes.push(props.className);
    }

    return classes;
});

const containerStyle = computed(() => {
    const style: Record<string, any> = {
        width: typeof props.width === "number" ? `${props.width}px` : props.width,
        ...cssVariables.value,
        ...(typeof props.style === "object" && props.style !== null
            ? props.style
            : {}),
    };

    if (props.fadeOut) {
        const mask =
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";
        style.maskImage = mask;
        style.webkitMaskImage = mask;
    }

    return style;
});

const isNodeItem = (item: LogoItem): item is LogoItemNode => "node" in item;

const getItemAriaLabel = (item: LogoItem): string | undefined => {
    if (isNodeItem(item)) {
        return item.ariaLabel ?? item.title;
    }
    return item.alt ?? item.title;
};

const handleMouseEnter = () => {
    if (props.pauseOnHover) {
        isHovered.value = true;
    }
};

const handleMouseLeave = () => {
    if (props.pauseOnHover) {
        isHovered.value = false;
    }
};

const updateDimensions = async () => {
    await nextTick();
    const containerWidth = containerRef.value?.clientWidth ?? 0;
    const sequenceWidth = seqRef.value?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
        seqWidth.value = Math.ceil(sequenceWidth);
        const copiesNeeded =
            Math.ceil(containerWidth / sequenceWidth) +
            ANIMATION_CONFIG.COPY_HEADROOM;
        copyCount.value = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);

        cleanupAnimation?.();
        cleanupAnimation = startAnimationLoop();

        // Reveal once layout has settled to avoid the initial flash of 2-copy state
        await nextTick();
        isReady.value = true;
    }
};

let resizeObserver: ResizeObserver | null = null;
const setupResizeObserver = () => {
    if (!window.ResizeObserver) {
        const handleResize = () => updateDimensions();
        window.addEventListener("resize", handleResize);
        updateDimensions();
        return () => window.removeEventListener("resize", handleResize);
    }

    resizeObserver = new ResizeObserver(updateDimensions);

    if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
    }
    if (seqRef.value) {
        resizeObserver.observe(seqRef.value);
    }

    updateDimensions();

    return () => {
        resizeObserver?.disconnect();
        resizeObserver = null;
    };
};

const setupImageLoader = () => {
    const images = seqRef.value?.querySelectorAll("img") ?? [];

    if (images.length === 0) {
        updateDimensions();
        return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
        remainingImages -= 1;
        if (remainingImages === 0) {
            updateDimensions();
        }
    };

    images.forEach((img) => {
        const htmlImg = img as HTMLImageElement;
        if (htmlImg.complete) {
            handleImageLoad();
        } else {
            htmlImg.addEventListener("load", handleImageLoad, { once: true });
            htmlImg.addEventListener("error", handleImageLoad, { once: true });
        }
    });

    return () => {
        images.forEach((img) => {
            img.removeEventListener("load", handleImageLoad);
            img.removeEventListener("error", handleImageLoad);
        });
    };
};

const startAnimationLoop = () => {
    const track = trackRef.value;
    if (!track) return;

    const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seqWidth.value > 0) {
        offsetRef.value =
            ((offsetRef.value % seqWidth.value) + seqWidth.value) %
            seqWidth.value;
        track.style.transform = `translate3d(${-offsetRef.value}px, 0, 0)`;
    }

    if (prefersReduced) {
        track.style.transform = "translate3d(0, 0, 0)";
        return () => {
            lastTimestampRef = null;
        };
    }

    const animate = (timestamp: number) => {
        if (lastTimestampRef === null) {
            lastTimestampRef = timestamp;
        }

        const deltaTime = Math.max(0, timestamp - lastTimestampRef) / 1000;
        lastTimestampRef = timestamp;

        const target =
            props.pauseOnHover && isHovered.value ? 0 : targetVelocity.value;

        const easingFactor =
            1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
        velocityRef.value += (target - velocityRef.value) * easingFactor;

        if (seqWidth.value > 0) {
            let nextOffset = offsetRef.value + velocityRef.value * deltaTime;
            nextOffset =
                ((nextOffset % seqWidth.value) + seqWidth.value) %
                seqWidth.value;
            offsetRef.value = nextOffset;

            const translateX = -offsetRef.value;
            track.style.transform = `translate3d(${translateX}px, 0, 0)`;
        }

        rafRef = requestAnimationFrame(animate);
    };

    rafRef = requestAnimationFrame(animate);

    return () => {
        if (rafRef !== null) {
            cancelAnimationFrame(rafRef);
            rafRef = null;
        }
        lastTimestampRef = null;
    };
};

let cleanupResize: (() => void) | undefined;
let cleanupImages: (() => void) | undefined;
let cleanupAnimation: (() => void) | undefined;

const cleanup = () => {
    cleanupResize?.();
    cleanupImages?.();
    cleanupAnimation?.();
};

onMounted(async () => {
    await nextTick();
    setTimeout(() => {
        cleanupResize = setupResizeObserver();
        cleanupImages = setupImageLoader();
    }, 10);
});

onUnmounted(() => {
    cleanup();
});

watch(
    [() => props.logos, () => props.gap, () => props.logoHeight],
    async () => {
        await nextTick();
        cleanupImages?.();
        cleanupImages = setupImageLoader();
    },
    { deep: true },
);

const LogoContent = defineComponent({
    name: "LogoContent",
    props: {
        item: {
            type: Object as () => LogoItem,
            required: true,
        },
        scaleOnHover: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const isNodeItem = (item: LogoItem): item is LogoItemNode =>
            "node" in item;

        return () => {
            const baseClasses = [
                "inline-flex items-center",
                "motion-reduce:transition-none",
            ];

            if (props.scaleOnHover) {
                baseClasses.push(
                    "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120",
                );
            }

            const itemStyle = typeof props.item.style === "string" ? {} : (props.item.style ?? {});

            if (isNodeItem(props.item)) {
                return h("span", {
                    class: [
                        ...baseClasses,
                        "text-[length:var(--logoloop-logoHeight)] [&>i]:text-[length:var(--logoloop-logoHeight)] [&>i]:leading-[1]",
                    ],
                    style: itemStyle,
                    innerHTML: props.item.node,
                    "aria-hidden":
                        !!(props.item as LogoItemNode).href &&
                        !(props.item as LogoItemNode).ariaLabel,
                });
            } else {
                const imgClasses = [
                    "h-[var(--logoloop-logoHeight)] w-auto block object-contain",
                    "[-webkit-user-drag:none] pointer-events-none",
                    "[image-rendering:-webkit-optimize-contrast]",
                    "motion-reduce:transition-none",
                ];

                if (props.scaleOnHover) {
                    imgClasses.push(
                        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120",
                    );
                }

                const imgStyle = { ...itemStyle } as Record<string, any>;
                if (props.item.width !== undefined) {
                    imgStyle.width = typeof props.item.width === "number" ? `${props.item.width}px` : props.item.width;
                }
                if (props.item.height !== undefined) {
                    imgStyle.height = typeof props.item.height === "number" ? `${props.item.height}px` : props.item.height;
                }

                return h("img", {
                    class: imgClasses,
                    style: imgStyle,
                    src: props.item.src,
                    srcset: props.item.srcSet,
                    sizes: props.item.sizes,
                    width: typeof props.item.width === "number" ? props.item.width : undefined,
                    height: typeof props.item.height === "number" ? props.item.height : undefined,
                    alt: props.item.alt ?? "",
                    title: props.item.title,
                    loading: "lazy",
                    decoding: "async",
                    draggable: false,
                });
            }
        };
    },
});
</script>
