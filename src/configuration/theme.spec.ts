import { describe, expect, it } from 'vitest';
import { THEME_BEFORE_FIRST_PAINT, THEME_STORAGE_KEY } from './theme';

describe('theme before the first paint', () => {
  it('reads the choice where the theme switcher keeps it', () => {
    expect(THEME_BEFORE_FIRST_PAINT).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
  });

  it('keeps the choice under the same key from one version to the next', () => {
    expect(THEME_STORAGE_KEY).toBe('untracked-maps.theme');
  });
});
