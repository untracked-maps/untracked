import { describe, expect, it } from 'vitest';
import { renderPage } from './page';

const page = (comment: string): string =>
  renderPage({
    rules: [
      { name: 'no-circular', comment, from: [], to: ['circular: true', 'path: ^src/'] },
      { name: 'no-orphans', comment: 'Unused.', from: ['orphan: true'], to: [] }
    ],
    folders: ['src/routes', 'src/configuration'],
    links: [
      { href: 'features.html', label: 'Features' },
      { href: 'https://example.org/adr', label: 'Decisions' }
    ]
  });

describe('architecture page', () => {
  it('lists each rule with its comment', () => {
    expect(page('No cycles.')).toContain('<td>No cycles.</td>');
  });

  it('shows each condition of a rule on its own line', () => {
    expect(page('')).toContain('<td><code>circular: true</code><br /><code>path: ^src/</code></td>');
  });

  it('puts the rules one after the other', () => {
    expect(page('')).toContain('</tr><tr><td><code>no-orphans</code>');
  });

  it('escapes ampersands and opening brackets', () => {
    expect(page('a < b & c')).toContain('a &lt; b &amp; c');
  });

  it('escapes closing brackets and double quotes', () => {
    expect(page('"a" > b')).toContain('&quot;a&quot; &gt; b');
  });

  it('lists the allowed folders one after the other', () => {
    expect(page('')).toContain('<ul><li><code>src/routes</code></li><li><code>src/configuration</code></li></ul>');
  });

  it('links the other generated documents one after the other', () => {
    expect(page('')).toContain(
      '<ul><li><a href="features.html">Features</a></li><li><a href="https://example.org/adr">Decisions</a></li></ul>'
    );
  });
});
