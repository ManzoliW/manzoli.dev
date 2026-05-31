<script setup lang="ts">
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

interface GrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  grainAmount?: number;
  grainScale?: number;
  animateGrain?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  rotation?: number;
  blending?: number;
  lightness?: number;
  paused?: boolean;
}

const props = withDefaults(defineProps<GrainientProps>(), {
  color1: '#ff0000',
  color2: '#00ff00',
  color3: '#0000ff',
  speed: 1.0,
  grainAmount: 0.05,
  grainScale: 1.5,
  animateGrain: true,
  contrast: 1.0,
  gamma: 1.0,
  saturation: 1.0,
  offsetX: 0.0,
  offsetY: 0.0,
  zoom: 1.0,
  warpStrength: 1.0,
  warpFrequency: 1.0,
  warpSpeed: 1.0,
  warpAmplitude: 1.0,
  rotation: 0,
  blending: 0.5,
  lightness: 0.0,
  paused: false,
});

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uAnimateGrain;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uOffset;
uniform float uZoom;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uRotation;
uniform float uBlending;
uniform float uLightness;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uOffset;
    float t = uTime * uWarpSpeed;
    
    uv.x += sin(uv.y * uWarpFrequency + t) * uWarpStrength * uWarpAmplitude * 0.1;
    uv.y += cos(uv.x * uWarpFrequency + t) * uWarpStrength * uWarpAmplitude * 0.1;

    float angle = uRotation * 3.14159 / 180.0;
    vec2 dir = vec2(cos(angle), sin(angle));
    float d = dot(uv - 0.5, dir) + 0.5;
    
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, uBlending, d));
    color = mix(color, uColor3, smoothstep(uBlending, 1.0, d));

    vec3 hsv = rgb2hsv(color);
    hsv.y *= uSaturation;
    hsv.z += uLightness;
    color = hsv2rgb(hsv);

    color = pow(color, vec3(1.0 / uGamma));
    color = (color - 0.5) * uContrast + 0.5;

    float grainTime = (uAnimateGrain > 0.5) ? uTime : 0.0;
    float g = noise(vUv * uGrainScale * 1000.0 + grainTime);
    color += (g - 0.5) * uGrainAmount;

    fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const intVal = parseInt(h, 16);
  if (isNaN(intVal)) return [0, 0, 0];
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  return [r, g, b];
};

const containerRef = useTemplateRef('containerRef');
const programRef = ref<Program | null>(null);
const rendererRef = ref<Renderer | null>(null);
const pausedRef = ref<boolean>(props.paused);
const isVisibleRef = ref<boolean>(true);
const meshRef = ref<Mesh | null>(null);

onMounted(() => {
  const container = containerRef.value;
  if (!container) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new Renderer({ dpr, alpha: true, antialias: false });
  rendererRef.value = renderer;

  const gl = renderer.gl;
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.inset = '0';
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  container.appendChild(gl.canvas);

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: hexToRgb(props.color1) },
      uColor2: { value: hexToRgb(props.color2) },
      uColor3: { value: hexToRgb(props.color3) },
      uGrainAmount: { value: props.grainAmount },
      uGrainScale: { value: props.grainScale },
      uAnimateGrain: { value: props.animateGrain ? 1 : 0 },
      uContrast: { value: props.contrast },
      uGamma: { value: props.gamma },
      uSaturation: { value: props.saturation },
      uOffset: { value: [props.offsetX, props.offsetY] },
      uZoom: { value: props.zoom },
      uWarpStrength: { value: props.warpStrength },
      uWarpFrequency: { value: props.warpFrequency },
      uWarpSpeed: { value: props.warpSpeed },
      uWarpAmplitude: { value: props.warpAmplitude },
      uRotation: { value: props.rotation },
      uBlending: { value: props.blending },
      uLightness: { value: props.lightness },
    }
  });

  programRef.value = program;

  const triangle = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry: triangle, program });
  meshRef.value = mesh;

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    if (meshRef.value) renderer.render({ scene: meshRef.value });
  };

  let ro: ResizeObserver | null = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  
  resize();

  let io: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      entries => {
        if (entries[0]) isVisibleRef.value = entries[0].isIntersecting;
      },
      { root: null, threshold: 0 }
    );
    io.observe(container);
  }

  let raf = 0;
  let last = performance.now();
  let accumTime = 0;

  const update = (now: number) => {
    const dt = Math.max(0, now - last) * 0.001;
    last = now;
    
    if (!pausedRef.value) accumTime += dt * props.speed;
    
    const visible = isVisibleRef.value && !document.hidden;
    if (!visible) {
      raf = requestAnimationFrame(update);
      return;
    }

    program.uniforms.uTime.value = accumTime;
    renderer.render({ scene: meshRef.value! });
    raf = requestAnimationFrame(update);
  };
  raf = requestAnimationFrame(update);

  onUnmounted(() => {
    cancelAnimationFrame(raf);
    ro?.disconnect();
    if (!ro) window.removeEventListener('resize', resize);
    io?.disconnect();
    try {
      container.removeChild(gl.canvas);
    } catch (e) {
      void e;
    }
    meshRef.value = null;
    programRef.value = null;
    rendererRef.value = null;
  });
});

watch(
  () => props.paused,
  v => (pausedRef.value = v)
);

watch(
  () => [
    props.color1, props.color2, props.color3, 
    props.grainAmount, props.grainScale, props.animateGrain,
    props.contrast, props.gamma, props.saturation,
    props.offsetX, props.offsetY, props.zoom,
    props.warpStrength, props.warpFrequency, props.warpSpeed, props.warpAmplitude,
    props.rotation, props.blending, props.lightness
  ],
  () => {
    const program = programRef.value;
    if (!program) return;

    program.uniforms.uColor1.value = hexToRgb(props.color1);
    program.uniforms.uColor2.value = hexToRgb(props.color2);
    program.uniforms.uColor3.value = hexToRgb(props.color3);
    program.uniforms.uGrainAmount.value = props.grainAmount;
    program.uniforms.uGrainScale.value = props.grainScale;
    program.uniforms.uAnimateGrain.value = props.animateGrain ? 1 : 0;
    program.uniforms.uContrast.value = props.contrast;
    program.uniforms.uGamma.value = props.gamma;
    program.uniforms.uSaturation.value = props.saturation;
    program.uniforms.uOffset.value = [props.offsetX, props.offsetY];
    program.uniforms.uZoom.value = props.zoom;
    program.uniforms.uWarpStrength.value = props.warpStrength;
    program.uniforms.uWarpFrequency.value = props.warpFrequency;
    program.uniforms.uWarpSpeed.value = props.warpSpeed;
    program.uniforms.uWarpAmplitude.value = props.warpAmplitude;
    program.uniforms.uRotation.value = props.rotation;
    program.uniforms.uBlending.value = props.blending;
    program.uniforms.uLightness.value = props.lightness;
  }
);
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden" />
</template>
