<script lang="ts">
  import type { Observable } from 'rxjs';
  import { on } from 'svelte/events';
  import { m } from '#i18n/messages';
  import ButtonLink from '#libraries/design/button-link.svelte';
  import CloseButton from '#libraries/design/close-button.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import WarningIcon from '#libraries/design/warning-icon.svelte';
  import '#libraries/design/tokens.css';
  import type { InspectedSpot } from '../../domain/inspect-point';
  import { spotCardOf } from './spot-card.presenter';

  type Props = {
    readonly spot: Observable<InspectedSpot>;
    readonly onClose: () => void;
  };

  const { spot, onClose }: Props = $props();

  const uid = $props.id();

  const card = $derived($spot.kind === 'none' ? undefined : spotCardOf($spot));

  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const closesOnEscape = (element: HTMLElement): (() => void) => on(element, 'keydown', closeOnEscape);
</script>

<div class="spot" aria-live="polite">
  {#if card !== undefined}
    <section aria-labelledby="{uid}-title" {@attach closesOnEscape}>
      <Floating>
        <div class="heading">
          <hgroup>
            <h2 id="{uid}-title">{card.title}</h2>
            <p>{card.subtitle}</p>
          </hgroup>
          <CloseButton label={m.inspect_point_close()} onclick={onClose} />
        </div>
        <ButtonLink href={card.reportHref} external tone="soft"><WarningIcon />{m.inspect_point_report()}</ButtonLink>
        <p class="contribute">
          {m.inspect_point_missing()}
          <a href={card.reportHref} rel="external">{m.inspect_point_report_on_openstreetmap()}</a>{m.inspect_point_free_map()}
        </p>
      </Floating>
    </section>
  {/if}
</div>

<style>
  .spot {
    inline-size: 100%;
  }

  .spot:empty {
    display: none;
  }

  section {
    inline-size: 100%;
    max-inline-size: 27.5rem;
  }

  section > :global(*) {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-l);
  }

  .heading {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-lead);
    line-height: var(--line-height-tight);
    color: var(--text);
  }

  hgroup p {
    margin: var(--space-1) 0 0;
    color: var(--text-muted);
  }

  .contribute {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  a {
    font-weight: var(--font-weight-strong);
  }
</style>
