import { describe, expect, it } from 'vitest';
import { WELCOME_BEFORE_FIRST_PAINT, WELCOME_STORAGE_KEY } from './welcome';

describe('welcome before the first paint', () => {
  it('reads the acknowledgement where the welcome card keeps it', () => {
    expect(WELCOME_BEFORE_FIRST_PAINT).toContain(`localStorage.getItem('${WELCOME_STORAGE_KEY}') === 'true'`);
  });

  it('marks the page as welcomed for the stylesheet', () => {
    expect(WELCOME_BEFORE_FIRST_PAINT).toContain("document.documentElement.dataset.welcomed = ''");
  });
});
