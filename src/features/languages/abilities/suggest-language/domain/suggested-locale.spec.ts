import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { suggestedLocale } from './suggested-locale';

const AVAILABLE: readonly string[] = ['en', 'fr'];

describe('suggested locale', () => {
  it('is the first preferred language the site offers', () => {
    expect(suggestedLocale(AVAILABLE, 'en', ['de-DE', 'fr', 'en'])).toBe('fr');
  });

  it('matches a regional variant to its language', () => {
    expect(suggestedLocale(AVAILABLE, 'en', ['fr-CA'])).toBe('fr');
  });

  it('ignores the case of the preferred language', () => {
    expect(suggestedLocale(AVAILABLE, 'en', ['FR-fr'])).toBe('fr');
  });

  it('is nothing when the page is already in the first offered preference', () => {
    expect(suggestedLocale(AVAILABLE, 'fr', ['fr-FR', 'en'])).toBeUndefined();
  });

  it('is nothing when no preferred language is offered', () => {
    expect(suggestedLocale(AVAILABLE, 'en', ['de-DE', 'es'])).toBeUndefined();
  });

  it('never suggests the language of the page', () => {
    const neverTheCurrentLocale = fc.property(
      fc.constantFrom(...AVAILABLE),
      fc.array(fc.string()),
      (current, preferred) => suggestedLocale(AVAILABLE, current, preferred) !== current
    );

    expect(fc.check(neverTheCurrentLocale).failed).toBe(false);
  });
});
