import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Notice } from '../../domain/show-notice';
import NoticeCard from './notice.svelte';

type Seen = {
  readonly events: string[];
  readonly shown: BehaviorSubject<Notice | undefined>;
};

const shownWith = async (text: string, label?: string): Promise<Seen> => {
  const events: string[] = [];
  const run = (): void => {
    events.push('ran');
  };
  const shown = new BehaviorSubject<Notice | undefined>(label === undefined ? { text } : { text, action: { label, run } });
  await render(NoticeCard, {
    shown,
    onAct: (): void => {
      events.push('acted');
    }
  });
  return { events, shown };
};

describe('a notice', () => {
  it('tells the visitor what happened', async () => {
    await shownWith('Link copied');

    await expect.element(page.getByRole('status')).toHaveTextContent('Link copied');
  });

  it('keeps an empty live region in place, so that what happens is announced', async () => {
    await render(NoticeCard, { shown: of(undefined), onAct: (): void => undefined });

    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });

  it('offers no action when it has none', async () => {
    await shownWith('Link copied');

    await expect.element(page.getByRole('button')).not.toBeInTheDocument();
  });

  it('offers its action', async () => {
    await shownWith('Recent places cleared', 'Undo');

    await expect.element(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  });

  it('runs its action, then says it was taken', async () => {
    const { events } = await shownWith('Recent places cleared', 'Undo');
    await page.getByRole('button', { name: 'Undo' }).click();

    expect(events).toEqual(['ran', 'acted']);
  });

  it('shows the next notice in place of the one shown', async () => {
    const { shown } = await shownWith('Link copied');
    shown.next({ text: 'Address copied' });

    await expect.element(page.getByRole('status')).toHaveTextContent('Address copied');
  });

  it('goes away when nothing is left to tell', async () => {
    const { shown } = await shownWith('Link copied');
    shown.next(undefined);

    await expect.element(page.getByText('Link copied')).not.toBeInTheDocument();
  });

  it('is a white card with corners of 16 px', async () => {
    await shownWith('Link copied');

    await expect
      .element(page.getByText('Link copied').element().closest<HTMLElement>('.floating'))
      .toHaveStyle({ borderRadius: '16px' });
  });

  it('gives its action a target 36 px high', async () => {
    await shownWith('Recent places cleared', 'Undo');

    await expect.element(page.getByRole('button', { name: 'Undo' })).toHaveStyle({ minBlockSize: '36px' });
  });
});
