<script lang="ts">
  import SearchIcon from '#libraries/design/search-icon.svelte';
  import '#libraries/design/tokens.css';
  import { type Observable, Subject } from 'rxjs';
  import { m } from '#i18n/messages';
  import type { Place } from '../../domain/place';
  import type { SearchState } from '../../domain/search-places';
  import {
    activePlaceOf,
    CLOSE,
    type Combobox,
    type ComboboxEvent,
    comboboxOf,
    isExpanded,
    optionsOf
  } from './combobox.presenter';
  import { detailsOf } from './kind-labels';
  import { statusOf } from './search-status';

  type Props = {
    readonly state: Observable<SearchState>;
    readonly onWake: () => void;
    readonly onQuery: (query: string) => void;
    readonly onChoose: (place: Place) => void;
    readonly ready?: boolean;
  };

  const { state, onWake, onQuery, onChoose, ready = true }: Props = $props();

  const uid = $props.id();

  const events = new Subject<ComboboxEvent>();

  const combobox: Observable<Combobox> = $derived(comboboxOf(state, events));

  const optionId = (index: number): string => `${uid}-place-${index}`;

  const typeText = (text: string): void => {
    events.next({ kind: 'typed', text });
    onQuery(text);
  };

  const choose = (place: Place): void => {
    events.next({ kind: 'chosen', place });
    onQuery(place.name);
    onChoose(place);
  };

  const chooseActive = (current: Combobox): void => {
    const place = activePlaceOf(current);
    if (place !== undefined) {
      choose(place);
    }
  };

  const dismiss = (current: Combobox): void => {
    if (current.open) {
      events.next(CLOSE);
    } else {
      typeText('');
    }
  };

  const move = (step: 1 | -1) => (): void => events.next({ kind: 'moved', step });

  const KEYS: ReadonlyMap<string, (current: Combobox) => void> = new Map([
    ['ArrowDown', move(1)],
    ['ArrowUp', move(-1)],
    ['Enter', chooseActive],
    ['Escape', dismiss]
  ]);

  const press = (event: KeyboardEvent): void => {
    const handle = KEYS.get(event.key);
    if (handle !== undefined) {
      event.preventDefault();
      handle($combobox);
    }
  };

  const typed = (event: Event & { readonly currentTarget: HTMLInputElement }): void => typeText(event.currentTarget.value);

  const close = (): void => events.next(CLOSE);

  const pick =
    (place: Place) =>
    (event: MouseEvent): void => {
      event.preventDefault();
      choose(place);
    };
</script>

<search>
  <label for="{uid}-query">{m.search_places_label()}</label>
  <span class="field">
    <SearchIcon />
    <input
      id="{uid}-query"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      disabled={!ready}
      placeholder={m.search_places_label()}
      aria-autocomplete="list"
      aria-expanded={isExpanded($combobox)}
      aria-controls="{uid}-places"
      aria-activedescendant={activePlaceOf($combobox) === undefined ? undefined : optionId($combobox.active)}
      value={$combobox.text}
      oninput={typed}
      onkeydown={press}
      onfocus={onWake}
      onblur={close}
    />
  </span>
  <p role="status">
    {#if statusOf($combobox) !== ''}
      {statusOf($combobox)}
    {/if}
  </p>
  <div id="{uid}-places" role="listbox" aria-label={m.search_places_places()} hidden={!isExpanded($combobox)}>
    {#each optionsOf($combobox) as place, index (place.id)}
      <div
        id={optionId(index)}
        role="option"
        tabindex="-1"
        aria-selected={index === $combobox.active}
        onmousedown={pick(place)}
      >
        <span>{place.name}</span>
        <span>{detailsOf(place)}</span>
      </div>
    {/each}
  </div>
</search>

<style>
  search {
    position: relative;
    z-index: 2;
    display: grid;
    gap: var(--space-2);
    inline-size: min(27.5rem, 100%);
    pointer-events: auto;
  }

  label {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }

  .field {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    min-block-size: var(--control-size);
    padding-inline: var(--space-4);
    color: var(--text-muted);
    background: var(--surface);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-float);
  }

  .field:focus-within {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  input {
    flex: 1;
    min-inline-size: 0;
    min-block-size: var(--control-size);
    padding: 0;
    font: inherit;
    font-size: var(--font-size-body);
    color: var(--text);
    outline: none;
    background: none;
    border: 0;
  }

  input::placeholder {
    color: var(--text-muted);
    opacity: 1;
  }

  p {
    padding: var(--space-2) var(--space-4);
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
    background: var(--surface);
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-float);
  }

  p:empty {
    padding: 0;
    background: none;
    box-shadow: none;
  }

  [role="listbox"] {
    overflow: hidden;
    background: var(--surface);
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-float);
  }

  [role="option"] {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
  }

  [role="option"] + [role="option"] {
    border-block-start: 1px solid var(--line);
  }

  [role="option"] span:first-child {
    font-weight: var(--font-weight-strong);
    color: var(--text);
  }

  [role="option"] span:last-child {
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  [role="option"]:hover,
  [role="option"][aria-selected="true"] {
    background: var(--accent-soft);
  }
</style>
