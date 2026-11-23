<script lang="ts">
  import { NEVER, type Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import BottomSheet from '#libraries/design/bottom-sheet.svelte';
  import { closedWhenAsked } from '#libraries/design/closable';
  import CloseButton from '#libraries/design/close-button.svelte';
  import CopyIcon from '#libraries/design/copy-icon.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/tokens.css';
  import ShareButton from '#libraries/design/share-button.svelte';
  import { addressLine } from '#libraries/postal-address/address-line.presenter';
  import { openedPlaceOf, type PlaceSheet, type SheetPlace } from '../../domain/open-place';
  import PlaceActions from './place-actions.svelte';
  import { addressOf } from './place-address.presenter';
  import PlaceDetails from './place-details.svelte';
  import PlaceGoodToKnow from './place-good-to-know.svelte';
  import { typeOf } from './place-type.presenter';

  type Props = {
    readonly sheet: Observable<PlaceSheet>;
    readonly onClose: () => void;
    readonly onCopy: (text: string) => void;
    readonly vibrate: (milliseconds: number) => void;
    readonly onSheetHeight?: (height: number) => void;
    readonly closings?: Observable<unknown>;
    readonly onShare?: (shared: {
      readonly title: string;
      readonly at: SheetPlace['coordinates'];
      readonly place: string;
    }) => void;
  };

  const { sheet, onClose, onCopy, vibrate, onSheetHeight, closings = NEVER, onShare }: Props = $props();

  const uid = $props.id();

  const place = $derived(openedPlaceOf($sheet));

  const address = $derived(addressOf($addressLine, place));
</script>

<div class="place" aria-live="polite">
  {#if place !== undefined}
    <BottomSheet
      subject={place.id}
      growLabel={m.sheet_grow()}
      reduceLabel={m.sheet_reduce()}
      {onClose}
      onHeight={onSheetHeight}
    >
      <section aria-labelledby="{uid}-name" {@attach closedWhenAsked(closings, onClose)}>
        <Floating>
          <div class="heading">
            <hgroup>
              <h2 id="{uid}-name">{place.name}</h2>
              <p>{typeOf(place)}</p>
            </hgroup>
            {#if onShare !== undefined}
              <div class="share">
                <ShareButton
                  label={m.share_link()}
                  onclick={(): void => onShare({ title: place.name, at: place.coordinates, place: place.id })}
                />
              </div>
            {/if}
            <div class="close">
              <CloseButton label={m.place_sheet_close()} onclick={onClose} />
            </div>
          </div>
          <PlaceActions {place} />
          <PlaceGoodToKnow {place} />
          <PlaceDetails {place} {address} {onCopy} {vibrate} />
          {#if address !== undefined}
            <div class="actions" data-sheet-actions>
              <button type="button" onclick={(): void => onCopy(address)}><CopyIcon />{m.place_sheet_copy_address()}</button>
            </div>
          {/if}
        </Floating>
      </section>
    </BottomSheet>
  {:else if $sheet.status === 'missing'}
    <BottomSheet subject="missing" growLabel={m.sheet_grow()} reduceLabel={m.sheet_reduce()} {onClose} onHeight={onSheetHeight}>
      <section aria-labelledby="{uid}-missing" {@attach closedWhenAsked(closings, onClose)}>
        <Floating>
          <div class="heading">
            <hgroup>
              <h2 id="{uid}-missing">{m.place_missing()}</h2>
              <p class="why">{m.place_missing_why()}</p>
            </hgroup>
            <div class="close">
              <CloseButton label={m.place_sheet_close()} onclick={onClose} />
            </div>
          </div>
        </Floating>
      </section>
    </BottomSheet>
  {/if}
</div>

<style>
  .place {
    position: absolute;
  }

  .place:empty {
    display: none;
  }

  section {
    inline-size: 100%;
  }

  section > :global(*) {
    display: grid;
    padding: var(--space-4);
    border-radius: var(--radius-l);
  }

  .heading {
    position: relative;
    padding-inline: 2.75rem;
    text-align: center;
  }

  h2 {
    margin: 0.125rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text);
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  hgroup p {
    margin: 0;
    font-size: 0.9375rem;
    color: light-dark(rgb(108 112 119), rgb(154 160 167));
  }

  hgroup p::first-letter {
    text-transform: uppercase;
  }

  hgroup .why {
    margin-block-start: var(--space-1);
    text-wrap: pretty;
  }

  .close {
    position: absolute;
    inset-block-start: calc(0.875rem - var(--space-4));
    inset-inline-end: calc(0.875rem - var(--space-4));
  }

  .share {
    position: absolute;
    inset-block-start: calc(0.875rem - var(--space-4));
    inset-inline-start: calc(0.875rem - var(--space-4));
  }

  .close :global(button)::after,
  .share :global(button)::after {
    position: absolute;
    inset: -0.375rem;
    content: "";
  }

  .close :global(button),
  .share :global(button) {
    position: relative;
  }

  .actions {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    gap: 0.375rem;
    margin-block-start: 0.875rem;
  }

  .actions button {
    display: grid;
    gap: var(--space-1);
    place-items: center;
    min-block-size: 2.875rem;
    padding: var(--space-2);
    font: inherit;
    font-size: clamp(0.65625rem, 2.9vw, 0.71875rem);
    font-weight: var(--font-weight-strong);
    color: var(--text);
    cursor: pointer;
    background: var(--surface-sunken);
    border: 0;
    border-radius: 0.875rem;
  }
</style>
