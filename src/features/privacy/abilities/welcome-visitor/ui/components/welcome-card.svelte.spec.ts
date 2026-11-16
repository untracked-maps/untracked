import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { welcomeVisitor } from '../../domain/welcome-visitor';
import WelcomeCard from './welcome-card.svelte';

const LEARN_MORE = /^Learn more:/u;

const props = { welcome: of(true), privacyHref: '/privacy', onAcknowledge: (): void => undefined, ready: true };

describe('welcome card', () => {
  it('is a region named by its title', async () => {
    await render(WelcomeCard, props);

    await expect.element(page.getByRole('region', { name: 'A map that does not track you' })).toBeVisible();
  });

  it('says that Untracked Maps keeps nothing about the visitor', async () => {
    await render(WelcomeCard, props);

    await expect.element(page.getByText('No account, no ads: Untracked Maps keeps nothing about you.')).toBeVisible();
  });

  it('lists what the map does without', async () => {
    await render(WelcomeCard, props);

    await expect.element(page.getByRole('list')).toHaveTextContent('0 trackers 0 cookies Open source');
  });

  it('invites the visitor to learn more', async () => {
    await render(WelcomeCard, props);

    await expect.element(page.getByText(LEARN_MORE)).toBeVisible();
  });

  it('leads to the page that says who sees what', async () => {
    await render(WelcomeCard, props);

    await expect.element(page.getByRole('link', { name: 'Who sees what' })).toHaveAttribute('href', '/privacy');
  });

  it('shows nothing once the visitor has been welcomed', async () => {
    await render(WelcomeCard, { ...props, welcome: of(false) });

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('disappears once acknowledged', async () => {
    const acknowledged = new BehaviorSubject(false);
    const welcome = welcomeVisitor({ acknowledged: () => acknowledged })();
    await render(WelcomeCard, {
      welcome,
      privacyHref: '/privacy',
      onAcknowledge: (): void => acknowledged.next(true),
      ready: true
    });

    await page.getByRole('button', { name: 'Got it' }).click();

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('keeps its acknowledgement unavailable until the page can answer it', async () => {
    await render(WelcomeCard, { ...props, ready: false });

    await expect.element(page.getByRole('button', { name: 'Got it' })).toBeDisabled();
  });
});
