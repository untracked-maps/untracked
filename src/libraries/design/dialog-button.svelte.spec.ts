import { Subject } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { type Closable, NEVER_ASKED } from './closable';
import DialogButton from './dialog-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const children = createRawSnippet(() => ({ render: (): string => '<a href="/privacy">Who sees what</a>' }));

const props = { label: 'About this map', title: 'Untracked Maps', closeLabel: 'Close', icon, children };

const open = async (closable: Closable = NEVER_ASKED): Promise<void> => {
  await render(DialogButton, { ...props, closable });
  await page.getByRole('button', { name: 'About this map' }).click();
};

const told = async (): Promise<readonly boolean[]> => {
  const toggles: boolean[] = [];
  await open({
    ...NEVER_ASKED,
    onToggle: (opened: boolean): void => {
      toggles.push(opened);
    }
  });
  return toggles;
};

describe('dialog button', () => {
  it('is named by its label', async () => {
    await render(DialogButton, props);

    await expect.element(page.getByRole('button', { name: 'About this map' })).toBeVisible();
  });

  it('keeps its dialog closed at first', async () => {
    await render(DialogButton, props);

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a dialog named by its title once pressed', async () => {
    await open();

    await expect.element(page.getByRole('dialog', { name: 'Untracked Maps' })).toBeVisible();
  });

  it('opens its dialog as a modal, leaving the rest of the page inert', async () => {
    await open();

    expect(page.getByRole('dialog').element().matches(':modal')).toBe(true);
  });

  it('shows its content in the dialog', async () => {
    await open();

    await expect.element(page.getByRole('dialog').getByRole('link', { name: 'Who sees what' })).toBeVisible();
  });
});

describe('dialog button closing', () => {
  it('closes its dialog with the close button', async () => {
    await open();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes its dialog with the Escape key', async () => {
    await open();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('gives the focus back to its button once the dialog closes', async () => {
    await open();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect.element(page.getByRole('button', { name: 'About this map' })).toHaveFocus();
  });
});

describe('dialog button description', () => {
  it('describes its dialog when given a description', async () => {
    await render(DialogButton, { ...props, description: 'A map that does not track you' });
    await page.getByRole('button', { name: 'About this map' }).click();

    await expect.element(page.getByRole('dialog')).toHaveAccessibleDescription('A map that does not track you');
  });

  it('leaves its dialog undescribed without a description', async () => {
    await open();

    await expect.element(page.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('shows no description without one', async () => {
    await open();

    await expect.element(page.getByRole('dialog').getByRole('paragraph')).not.toBeInTheDocument();
  });
});

describe('dialog button, for what closes it from outside', () => {
  it('tells when its dialog opens', async () => {
    const toggles = await told();

    await expect.poll(() => toggles).toEqual([true]);
  });

  it('tells its dialog opens at once, before the next key is pressed', async () => {
    const heard: string[] = [];
    const onToggle = (opened: boolean): void => {
      heard.push(opened ? 'opened' : 'closed');
    };
    await render(DialogButton, { ...props, closable: { ...NEVER_ASKED, onToggle } });

    document.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')?.click();

    expect(heard).toEqual(['opened']);
  });

  it('tells when its dialog closes', async () => {
    const toggles = await told();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect.poll(() => toggles).toEqual([true, false]);
  });

  it('closes its dialog when asked to', async () => {
    const closings = new Subject<void>();
    await open({ ...NEVER_ASKED, closings });

    closings.next();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });
});
