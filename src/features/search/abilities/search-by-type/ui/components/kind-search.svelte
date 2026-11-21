<script lang="ts">
  import BottomSheet from '#libraries/design/bottom-sheet.svelte';
  import { closedWhenAsked } from '#libraries/design/closable';
  import CloseIcon from '#libraries/design/close-icon.svelte';
  import Suggestion from '#libraries/design/suggestion.svelte';
  import '#libraries/design/tokens.css';
  import { NEVER, type Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { addressLine } from '#libraries/postal-address/address-line.presenter';
  import type { Place, PlaceKind } from '../../../../domain/place';
  import { detailsOf } from '../../../../ui/components/kind-labels';
  import { MAIN_KINDS } from '../../domain/main-kinds';
  import type { KindSearch } from '../../domain/search-by-type';
  import KindDot from './kind-dot.svelte';
  import { pluralOf } from './kind-plurals';
  import { statusOf } from './kind-search-status';

  type Props = {
    readonly search: Observable<KindSearch>;
    readonly onChoose: (kind?: PlaceKind) => void;
    readonly onChoosePlace: (place: Place) => void;
    readonly ready?: boolean;
    readonly covered?: boolean;
    readonly onSheetHeight?: (height: number) => void;
    readonly closings?: Observable<unknown>;
  };

  const { search, onChoose, onChoosePlace, ready = true, covered = false, onSheetHeight, closings = NEVER }: Props = $props();

  const uid = $props.id();

  const shownKind: PlaceKind | undefined = $derived('placeKind' in $search ? $search.placeKind : undefined);

  const chipId = (kind: PlaceKind): string => `${uid}-${kind}`;

  const focusChip = (kind: PlaceKind): void => document.querySelector<HTMLElement>(`#${CSS.escape(chipId(kind))}`)?.focus();

  const toggle = (kind: PlaceKind) => (): void => onChoose(kind === shownKind ? undefined : kind);

  const close = (kind: PlaceKind) => (): void => {
    focusChip(kind);
    onChoose();
  };

  const choose = (kind: PlaceKind, place: Place) => (): void => {
    close(kind)();
    onChoosePlace(place);
  };

  const closeFrom =
    (kind: PlaceKind) =>
    (list: HTMLElement): void => {
      if (list.contains(document.activeElement)) {
        focusChip(kind);
      }
      onChoose();
    };
</script>

<div class="kind-search">
  <ul class="kinds" aria-label={m.search_by_type_kinds()}>
    {#each MAIN_KINDS as kind (kind)}
      <li>
        <button
          id={chipId(kind)}
          type="button"
          class="chip"
          aria-pressed={kind === shownKind}
          disabled={!ready}
          onclick={toggle(kind)}
        >
          <KindDot {kind} />
          {pluralOf(kind)}
        </button>
      </li>
    {/each}
  </ul>
  <p role="status" class="announced">{statusOf($search)}</p>
  {#if shownKind !== undefined}
    <BottomSheet
      opening="peek"
      subject={shownKind}
      {covered}
      growLabel={m.sheet_grow()}
      reduceLabel={m.sheet_reduce()}
      onHeight={onSheetHeight}
    >
      <section class="places" aria-labelledby="{uid}-title" {@attach closedWhenAsked(closings, closeFrom(shownKind))}>
        <div class="heading">
          <h2 id="{uid}-title">{pluralOf(shownKind)}</h2>
          <button type="button" class="close" aria-label={m.search_by_type_close()} onclick={close(shownKind)}>
            <CloseIcon />
          </button>
        </div>
        <p>{statusOf($search)}</p>
        {#if $search.status === 'found'}
          <ul>
            {#each $search.places as place (place.id)}
              <li>
                <button type="button" class="place" onclick={choose($search.placeKind, place)}>
                  <Suggestion name={place.name} details={detailsOf($addressLine)(place)}>
                    {#snippet icon()}
                      <KindDot kind={place.kind} />
                    {/snippet}
                  </Suggestion>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </BottomSheet>
  {/if}
</div>

<style>
  .kind-search {
    display: grid;
    gap: var(--space-3);
    inline-size: min(27.5rem, 100%);
    pointer-events: none;
  }

  .kinds {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-1) var(--edge) var(--space-3);
    margin: calc(-1 * var(--space-1)) calc(-1 * var(--edge)) calc(-1 * var(--space-3));
    overflow-x: auto;
    pointer-events: auto;
    list-style: none;
    scrollbar-width: none;
  }

  .chip {
    display: inline-flex;
    flex: none;
    gap: var(--space-2);
    align-items: center;
    min-block-size: 2rem;
    padding: 0 var(--space-3) 0 var(--space-3);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-strong);
    color: var(--text);
    cursor: pointer;
    background: var(--surface);
    border: 0;
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-near);
  }

  .chip[aria-pressed="true"] {
    color: var(--text-on-accent);
    background: var(--accent-strong);
  }

  .chip[aria-pressed="true"] :global(.dot) {
    background: var(--text-on-accent);
  }

  .places {
    display: grid;
    pointer-events: auto;
  }

  .heading {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-2) 0 var(--space-4);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-body);
  }

  .places ul {
    padding: 0 0 var(--space-2);
    margin: 0;
    list-style: none;
  }

  .close,
  .place {
    padding: 0;
    color: inherit;
    cursor: pointer;
    background: none;
    border: 0;
  }

  .close {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    color: var(--text-muted);
    border-radius: 50%;
  }

  .close:hover {
    background: var(--surface-sunken);
  }

  .place {
    display: block;
    inline-size: 100%;
  }

  .place:focus-visible {
    outline-offset: -3px;
  }

  p {
    padding: var(--space-1) var(--space-4) var(--space-2);
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  .announced {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }

  @media (width >= 700px), (width >= 560px) and (orientation: landscape) {
    .kind-search {
      inline-size: auto;
    }

    .kinds {
      padding: var(--space-1) 0;
      margin: 0;
    }
  }

  @media (width >= 900px) {
    .kinds {
      flex-wrap: wrap;
      overflow: visible;
      mask-image: none;
    }
  }
</style>
