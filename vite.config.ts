import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type ViteUserConfig } from 'vitest/config';
import { kitBasePath, type Locales, localeUrlPatterns } from '#libraries/base-path/base-path';

const PATH_SEPARATOR = /[/\\]/u;

const SVELTEKIT_ANNOUNCER_STYLE =
  'position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px';

const sha256 = (text: string): `sha256-${string}` => `sha256-${createHash('sha256').update(text).digest('base64')}`;

const basePath = process.env['BASE_PATH'] ?? '';
const locales: Locales = JSON.parse(readFileSync('./project.inlang/settings.json', 'utf8'));
const urlPatterns = localeUrlPatterns(basePath, locales);

const config: ViteUserConfig = defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) => (filename.split(PATH_SEPARATOR).includes('node_modules') ? undefined : true)
      },
      adapter: adapter(),
      paths: { relative: false, base: kitBasePath(basePath) },
      csp: {
        mode: 'hash',
        directives: {
          'default-src': ['self'],
          'script-src': ['self'],
          'style-src': ['self'],
          'style-src-attr': ['unsafe-hashes', sha256(SVELTEKIT_ANNOUNCER_STYLE)],
          'img-src': ['self', 'data:'],
          'font-src': ['self'],
          'connect-src': ['self'],
          'manifest-src': ['self'],
          'worker-src': ['self'],
          'object-src': ['none'],
          'base-uri': ['self'],
          'form-action': ['self']
        }
      }
    }),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './.paraglide',
      emitTsDeclarations: true,
      strategy: ['url', 'baseLocale'],
      ...(urlPatterns === undefined ? {} : { urlPatterns })
    })
  ],
  test: {
    expect: { requireAssertions: true },
    allowOnly: false,
    passWithNoTests: false,
    sequence: { shuffle: true },
    coverage: {
      provider: 'v8',
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
      include: ['src/{features,libraries,configuration}/**/*.{ts,svelte}'],
      exclude: ['**/index.ts', '**/*.steps.ts', 'src/libraries/*/cli.ts']
    },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }]
          },
          include: ['src/**/*.svelte.spec.ts']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/**/*.svelte.spec.ts']
        }
      }
    ]
  }
});

export default config;
