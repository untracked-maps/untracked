import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type ViteUserConfig } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';
import { THEME_BEFORE_FIRST_PAINT } from '#configuration/theme';
import { WELCOME_BEFORE_FIRST_PAINT } from '#configuration/welcome';
import { kitBasePath, type Locales, localeUrlPatterns } from '#libraries/base-path/base-path';

const PATH_SEPARATOR = /[/\\]/u;

const SVELTEKIT_ANNOUNCER_STYLE =
  'position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px';

const sha256 = (text: string): `sha256-${string}` => `sha256-${createHash('sha256').update(text).digest('base64')}`;

const basePath = process.env['BASE_PATH'] ?? '';
const locales: Locales = JSON.parse(readFileSync('./project.inlang/settings.json', 'utf8'));
const urlPatterns = localeUrlPatterns(basePath, locales);
const { version }: { readonly version: string } = JSON.parse(readFileSync('./package.json', 'utf8'));
const OUTSIDE_THE_PAGE = -1;

const parkPointer: BrowserCommand<[]> = async ({ page }) => {
  await page.mouse.move(OUTSIDE_THE_PAGE, OUTSIDE_THE_PAGE);
};

const reduceMotion: BrowserCommand<[reduced: boolean]> = async ({ page }, reduced) => {
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
};

const config: ViteUserConfig = defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) => (filename.split(PATH_SEPARATOR).includes('node_modules') ? undefined : true)
      },
      adapter: adapter(),
      version: { name: version },
      paths: { relative: false, base: kitBasePath(basePath) },
      csp: {
        mode: 'hash',
        directives: {
          'default-src': ['self'],
          'script-src': ['self', sha256(THEME_BEFORE_FIRST_PAINT), sha256(WELCOME_BEFORE_FIRST_PAINT)],
          'style-src': ['self'],
          'style-src-attr': ['unsafe-hashes', sha256(SVELTEKIT_ANNOUNCER_STYLE)],
          'img-src': ['self', 'data:'],
          'font-src': ['self'],
          'connect-src': [
            'self',
            'https://tiles.openfreemap.org',
            'https://data.geopf.fr',
            'https://data.iledefrance-mobilites.fr'
          ],
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
            instances: [{ browser: 'chromium', headless: true }],
            trace: { mode: 'retain-on-failure', tracesDir: '.vitest/traces' },
            commands: { parkPointer, reduceMotion }
          },
          include: ['src/**/*.svelte.spec.ts'],
          setupFiles: ['./vitest.browser-setup.ts']
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
