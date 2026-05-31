/**
 * Centralized theme constants for the manzoli.dev project.
 * These should be kept in sync with tailwind.config.ts.
 */

export const THEME = {
    colors: {
        page: '#e8e2d3',
        paper: '#f5f1e6',
        ink: '#1a1612',
        teal: '#003c33',
        coral: '#ff7759',
        rule: '#1a16121a',
        muted: '#1a161266',
    },
    // WebGL Palettes
    palettes: {
        prismatic: {
            work: ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'],
            dark: ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'],
            light: ['#e7e2dd', '#a9c6c2', '#a8c3bc', '#0c0c0c', '#e2c4ed', '#fcd4da', '#748be4', '#8494f4'],
        },
        grainient: {
            light: {
                color1: '#d1e9ff',
                color2: '#ffd6e8',
                color3: '#d1fff0',
            },
            dark: {
                color1: '#0a0a0f',
                color2: '#1a2e2d',
                color3: '#2e1a2e',
            }
        }
    }
} as const;
