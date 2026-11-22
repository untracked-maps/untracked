<script lang="ts">
  import { closedWhenAsked } from '#libraries/design/closable';
  import CloseIcon from '#libraries/design/close-icon.svelte';
  import PinIcon from '#libraries/design/pin-icon.svelte';
  import SearchIcon from '#libraries/design/search-icon.svelte';
  import SignpostIcon from '#libraries/design/signpost-icon.svelte';
  import Suggestion from '#libraries/design/suggestion.svelte';
  import '#libraries/design/tokens.css';
  import { NEVER, type Observable, Subject } from 'rxjs';
  import type { Snippet } from 'svelte';
  import { on } from 'svelte/events';
  import { m } from '#i18n/messages';
  import { addressLine } from '#libraries/postal-address/address-line.presenter';
  import { type Found, isAddress } from '../../../../domain/found';
  import { detailsOf } from '../../../../ui/components/kind-labels';
  import type { SearchState } from '../../domain/search-places';
  import {
    activePlaceOf,
    CLOSE,
    type Combobox,
    type ComboboxEvent,
    comboboxOf,
    isExpanded,
    OPEN,
    offersSuggestions,
    optionsOf,
    type SearchPanel
  } from './combobox.presenter';
  import { statusOf } from './search-status';

  type Props = {
    readonly state: Observable<SearchState>;
    readonly onWake: () => void;
    readonly onQuery: (query: string) => void;
    readonly onChoose: (place: Found) => void;
    readonly lead?: Snippet<[SearchPanel]>;
    readonly suggestions?: Snippet<[SearchPanel]>;
    readonly ready?: boolean;
    readonly onOpen?: (open: boolean) => void;
    readonly closings?: Observable<unknown>;
  };

  const {
    state,
    onWake,
    onQuery,
    onChoose,
    lead,
    suggestions,
    ready = true,
    onOpen = (): void => undefined,
    closings = NEVER
  }: Props = $props();

  const uid = $props.id();

  const fieldId = `${uid}-query`;

  const events = new Subject<ComboboxEvent>();

  const combobox: Observable<Combobox> = $derived(comboboxOf(state, events));

  const statusClass = $derived(isExpanded($combobox) ? 'announced' : undefined);

  const optionId = (index: number): string => `${uid}-place-${index}`;

  const typeText = (text: string): void => {
    events.next({ kind: 'typed', text });
    onQuery(text);
  };

  const focusField = (): void => document.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`)?.focus();

  const settleUnfocused = (text: string): void => {
    events.next({ kind: 'chosen', text });
    onQuery(text);
  };

  const settle = (text: string): void => {
    focusField();
    settleUnfocused(text);
  };

  const clear = (): void => {
    focusField();
    typeText('');
  };

  const choose = (place: Found): void => {
    settle(place.name);
    onChoose(place);
  };

  const chooseActive = (current: Combobox): void => {
    const place = activePlaceOf(current);
    if (place !== undefined) {
      choose(place);
    }
  };

  const tellTextIsLeft = ({ text }: Combobox): void => {
    if (text !== '') {
      onOpen(true);
    }
  };

  const close = (current: Combobox): void => {
    if (current.open) {
      focusField();
      events.next(CLOSE);
      tellTextIsLeft(current);
    } else {
      settleUnfocused('');
    }
  };

  const closeNow = (): void => close($combobox);

  const isOpen = $derived($combobox.open || $combobox.text !== '');

  $effect(() => onOpen(isOpen));

  const move = (step: 1 | -1) => (): void => events.next({ kind: 'moved', step });

  const KEYS: ReadonlyMap<string, (current: Combobox) => void> = new Map([
    ['ArrowDown', move(1)],
    ['ArrowUp', move(-1)],
    ['Enter', chooseActive]
  ]);

  const press = (event: KeyboardEvent): void => {
    const handle = KEYS.get(event.key);
    if (handle !== undefined) {
      event.preventDefault();
      handle($combobox);
    }
  };

  const typed = (event: Event & { readonly currentTarget: HTMLInputElement }): void => typeText(event.currentTarget.value);

  const open = (): void => events.next(OPEN);

  const wake = (): void => {
    onWake();
    open();
  };

  const leave = (event: FocusEvent & { readonly currentTarget: HTMLElement }): void => {
    if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
      events.next(CLOSE);
    }
  };

  const keepFocus = (event: MouseEvent): void => event.preventDefault();

  const hostedIn = (element: HTMLElement): (() => void) => on(element, 'mousedown', keepFocus);

  const pick =
    (place: Found) =>
    (event: MouseEvent): void => {
      event.preventDefault();
      choose(place);
    };
</script>

<search onfocusout={leave} {@attach closedWhenAsked(closings, closeNow)}>
  <label for={fieldId}>{m.search_places_label()}</label>
  <span class="field">
    <SearchIcon />
    <input
      id={fieldId}
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      enterkeyhint="search"
      disabled={!ready}
      placeholder={m.search_places_label()}
      aria-autocomplete="list"
      aria-expanded={isExpanded($combobox)}
      aria-controls="{uid}-places"
      aria-activedescendant={activePlaceOf($combobox) === undefined ? undefined : optionId($combobox.active)}
      value={$combobox.text}
      oninput={typed}
      onkeydown={press}
      onfocus={wake}
      onclick={open}
    />
    {#if $combobox.text !== ''}
      <button type="button" class="clear" tabindex="-1" aria-label={m.search_places_clear()} onclick={clear}>
        <CloseIcon />
      </button>
    {/if}
  </span>
  {#if $combobox.open && lead !== undefined}
    <div class="lead" {@attach hostedIn}>
      {@render lead({ settle, focusField })}
    </div>
  {/if}
  {#if offersSuggestions($combobox) && suggestions !== undefined}
    <div class="suggestions" {@attach hostedIn}>
      {@render suggestions({ settle, focusField })}
    </div>
  {/if}
  <div id="{uid}-places" role="listbox" aria-label={m.search_places_places()} hidden={!isExpanded($combobox)}>
    {#each optionsOf($combobox) as place, index (place.id)}
      <div
        id={optionId(index)}
        role="option"
        tabindex="-1"
        aria-selected={index === $combobox.active}
        onmousedown={pick(place)}
      >
        <Suggestion name={place.name} details={detailsOf($addressLine)(place)} active={index === $combobox.active}>
          {#snippet icon()}
            {#if isAddress(place)}
              <SignpostIcon />
            {:else}
              <PinIcon />
            {/if}
          {/snippet}
        </Suggestion>
      </div>
    {/each}
  </div>
  <p role="status" class={statusClass}>
    {#if statusOf($combobox) !== ''}
      {statusOf($combobox)}
    {/if}
  </p>
</search>

<style>
  search {
    position: relative;
    z-index: 2;
    inline-size: min(27.5rem, 100%);
    overflow: clip;
    pointer-events: auto;
    background: var(--surface);
    border-radius: calc(var(--control-size) / 2);
    box-shadow: var(--shadow-float);
  }

  search:has(input:focus) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  label,
  .announced {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }

  .field {
    display: grid;
    grid-template-columns: var(--control-size) minmax(0, 1fr) auto;
    align-items: center;
    justify-items: center;
    color: var(--text-muted);
  }

  input {
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: var(--control-size);
    padding: 0 var(--space-4) 0 0;
    font-size: var(--font-size-lead);
    color: var(--text);
    outline: none;
    background: none;
    border: 0;
  }

  .clear {
    display: grid;
    place-items: center;
    inline-size: 2.875rem;
    block-size: 2.875rem;
    padding: 0;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: 50%;
  }

  input::placeholder {
    color: var(--text-muted);
    opacity: 1;
  }

  .lead,
  .suggestions,
  [role="listbox"] {
    max-block-size: 60dvh;
    padding-block: var(--space-1) var(--space-2);
    overflow-y: auto;
    overscroll-behavior: contain;
    border-block-start: 1px solid var(--line);
  }

  .lead:not(:has(> :global(*))),
  .suggestions:not(:has(> :global(*))) {
    display: none;
  }

  [role="listbox"][hidden] {
    display: none;
  }

  p {
    padding: var(--space-3) var(--space-4) var(--space-3) var(--control-size);
    margin: 0;
    color: var(--text-muted);
    border-block-start: 1px solid var(--line);
  }

  p:empty {
    padding: 0;
    border: 0;
  }
</style>
