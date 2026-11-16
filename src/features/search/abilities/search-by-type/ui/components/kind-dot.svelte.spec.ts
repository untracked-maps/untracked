import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import KindDot from './kind-dot.svelte';

const dotOf = async (kind: 'bakery' | 'pharmacy' | 'school'): Promise<HTMLElement> => {
  const { container } = await render(KindDot, { kind });
  const dot = container.querySelector<HTMLElement>('[data-kind]');
  if (dot === null) {
    throw new Error('The dot was not drawn.');
  }
  return dot;
};

describe('dot of a kind', () => {
  it('is hidden from assistive technologies', async () => {
    expect((await dotOf('bakery')).getAttribute('aria-hidden')).toBe('true');
  });

  it('takes the colour of food for a bakery', async () => {
    expect(getComputedStyle(await dotOf('bakery')).backgroundColor).toBe('rgb(232, 116, 47)');
  });

  it('takes the colour of health for a pharmacy', async () => {
    expect(getComputedStyle(await dotOf('pharmacy')).backgroundColor).toBe('rgb(216, 74, 69)');
  });

  it('is grey for a kind of no family', async () => {
    expect(getComputedStyle(await dotOf('school')).backgroundColor).toBe('rgb(107, 113, 120)');
  });
});
