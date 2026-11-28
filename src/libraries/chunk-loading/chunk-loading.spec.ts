import type { Manifest } from 'vite';
import { describe, expect, it } from 'vitest';
import { onDemandChunks, startUpChunks } from './chunk-loading';

const manifest: Manifest = {
  'app.js': { file: 'entry/app.js', isEntry: true, imports: ['_runtime.js'], dynamicImports: ['search.ts'] },
  'page.js': { file: 'nodes/page.js', isEntry: true, imports: ['_runtime.js', '_map.js'] },
  '_runtime.js': { file: 'chunks/runtime.js', imports: ['_signals.js'] },
  '_signals.js': { file: 'chunks/signals.js', imports: ['_runtime.js'] },
  '_map.js': { file: 'chunks/map.js', dynamicImports: ['_runtime.js'] },
  'search.ts': { file: 'chunks/search.js', isDynamicEntry: true, imports: ['_index.js', '_runtime.js', '_lost.js'] },
  '_index.js': { file: 'chunks/index.js' },
  '_style.css': { file: 'assets/style.css' }
};

describe('chunks loaded at start-up', () => {
  it('are the entries and the chunks their static imports reach, each once', () => {
    expect(startUpChunks(manifest)).toEqual([
      'entry/app.js',
      'nodes/page.js',
      'chunks/runtime.js',
      'chunks/map.js',
      'chunks/signals.js'
    ]);
  });

  it('are none in a manifest without an entry', () => {
    expect(startUpChunks({ '_index.js': { file: 'chunks/index.js' } })).toEqual([]);
  });
});

describe('chunks loaded on demand', () => {
  it('are those that only a dynamic import reaches, with their own imports, but those missing from the manifest', () => {
    expect(onDemandChunks(manifest)).toEqual(['chunks/search.js', 'chunks/index.js']);
  });

  it('are none when every dynamic import is also a static one', () => {
    expect(
      onDemandChunks({
        'app.js': { file: 'entry/app.js', isEntry: true, imports: ['_map.js'], dynamicImports: ['_map.js'] },
        '_map.js': { file: 'chunks/map.js' }
      })
    ).toEqual([]);
  });
});
