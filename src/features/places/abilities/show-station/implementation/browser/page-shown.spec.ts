import { filter, firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { pageShown } from './page-shown';

const page = (visibilityState: DocumentVisibilityState): EventTarget & { visibilityState: DocumentVisibilityState } =>
  Object.assign(new EventTarget(), { visibilityState });

describe('the page shown', () => {
  it('is shown when there is no page', async () => {
    expect(await firstValueFrom(pageShown(undefined))).toBe(true);
  });

  it('tells at once that the page is shown', async () => {
    expect(await firstValueFrom(pageShown(page('visible')))).toBe(true);
  });

  it('tells at once whether the page is shown', async () => {
    expect(await firstValueFrom(pageShown(page('hidden')))).toBe(false);
  });

  it('tells when the page is hidden', async () => {
    const shown = page('visible');
    const told = firstValueFrom(pageShown(shown).pipe(filter((visible: boolean) => !visible)));
    shown.visibilityState = 'hidden';
    shown.dispatchEvent(new Event('visibilitychange'));
    expect(await told).toBe(false);
  });
});
