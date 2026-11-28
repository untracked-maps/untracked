import { defineConfig, type ViteUserConfig } from 'vitest/config';

const config: ViteUserConfig = defineConfig({
  test: {
    expect: { requireAssertions: true },
    allowOnly: false,
    passWithNoTests: false,
    sequence: { shuffle: true },
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.svelte.spec.ts']
  }
});

export default config;
