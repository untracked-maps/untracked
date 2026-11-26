<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { getLocale } from '#i18n/runtime';
  import type { Closable } from '#libraries/design/closable';
  import DialogButton from '#libraries/design/dialog-button.svelte';
  import InfoIcon from '#libraries/design/info-icon.svelte';
  import '#libraries/design/tokens.css';
  import type { Glance } from '../../domain/glance-at-place';
  import { freshnessText } from './place-glance.presenter';

  type Props = {
    readonly glance: Observable<Glance>;
    readonly closable?: Closable;
    readonly locale?: string;
  };

  const { glance, closable, locale = getLocale() }: Props = $props();

  const freshness = $derived($glance.freshness);
</script>

{#if freshness !== undefined}
  <div class={freshness.state === 'verified' ? 'verified' : 'old'}>
    {#if freshness.state === 'verified'}
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    {/if}
    <span>{freshnessText(freshness, locale)}</span>
    <DialogButton
      label={m.place_freshness_explain()}
      title={m.place_freshness_title()}
      closeLabel={m.place_freshness_close()}
      trigger="inline"
      {...closable === undefined ? {} : { closable }}
    >
      {#snippet icon()}
        <InfoIcon />
      {/snippet}
      <p>{m.place_freshness_who()}</p>
      <p>{m.place_freshness_what()}</p>
    </DialogButton>
  </div>
{/if}

<style>
  .verified,
  .old {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    margin: 0.1875rem 0 0;
    font-size: 0.8125rem;
  }

  .verified {
    color: var(--open);
  }

  .old {
    color: var(--text-muted);
  }

  svg {
    flex-shrink: 0;
    inline-size: 0.875rem;
    block-size: 0.875rem;
    fill: none;
    stroke: currentcolor;
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  div :global(dialog) {
    text-align: start;
  }

  div :global(dialog p) {
    margin: 0;
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    color: var(--text);
  }
</style>
