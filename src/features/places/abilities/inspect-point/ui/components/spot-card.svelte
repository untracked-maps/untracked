<script lang="ts">
  import { NEVER, type Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import BottomSheet from '#libraries/design/bottom-sheet.svelte';
  import ButtonLink from '#libraries/design/button-link.svelte';
  import { closedWhenAsked } from '#libraries/design/closable';
  import CloseButton from '#libraries/design/close-button.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import WarningIcon from '#libraries/design/warning-icon.svelte';
  import '#libraries/design/tokens.css';
  import type { InspectedSpot } from '../../domain/inspect-point';
  import { spotCardOf } from './spot-card.presenter';

  type Props = {
    readonly spot: Observable<InspectedSpot>;
    readonly onClose: () => void;
    readonly onSheetHeight?: (height: number) => void;
    readonly closings?: Observable<unknown>;
  };

  const { spot, onClose, onSheetHeight, closings = NEVER }: Props = $props();

  const uid = $props.id();

  const card = $derived($spot.kind === 'none' ? undefined : spotCardOf($spot));
</script>

<div class="spot" aria-live="polite">
  {#if card !== undefined}
    <BottomSheet
      subject={card.reportHref}
      growLabel={m.sheet_grow()}
      reduceLabel={m.sheet_reduce()}
      {onClose}
      onHeight={onSheetHeight}
    >
      <section aria-labelledby="{uid}-title" {@attach closedWhenAsked(closings, onClose)}>
        <Floating>
          <div class="heading">
            <hgroup>
              <h2 id="{uid}-title">{card.title}</h2>
              <p>{card.subtitle}</p>
            </hgroup>
            <CloseButton label={m.inspect_point_close()} onclick={onClose} />
          </div>
          <div data-sheet-actions>
            <ButtonLink href={card.reportHref} external tone="soft"><WarningIcon />{m.inspect_point_report()}</ButtonLink>
          </div>
          <p class="contribute">
            {m.inspect_point_missing()}
            <a href={card.reportHref} rel="external">{m.inspect_point_report_on_openstreetmap()}</a>{m.inspect_point_free_map()}
          </p>
        </Floating>
      </section>
    </BottomSheet>
  {/if}
</div>

<style>
  .spot {
    position: absolute;
  }

  .spot:empty {
    display: none;
  }

  section {
    inline-size: 100%;
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
