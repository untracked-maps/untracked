<script lang="ts">
  import { type Observable, Subject, startWith } from 'rxjs';
  import { m } from '#i18n/messages';
  import { getLocale } from '#i18n/runtime';
  import '#libraries/design/tokens.css';
  import type { StationView } from '../../domain/show-station';
  import type { Coordinates } from '../../domain/station-exits';
  import { accessText, exitText, lineName, toldText } from './station.presenter';

  type Props = {
    readonly station: Observable<StationView>;
    readonly onExit: (at: Coordinates) => void;
    readonly locale?: string;
  };

  const { station, onExit, locale = getLocale() }: Props = $props();

  const uid = $props.id();

  const FIRST_EXITS = 4;

  const opened = new Subject<string>();

  const allExitsOf = opened.pipe(startWith(undefined));

  const cut = (id: string, count: number): boolean => $allExitsOf !== id && count > FIRST_EXITS;

  const coloured =
    (colour: string, textColour: string) =>
    (badge: HTMLElement): void => {
      badge.style.setProperty('background-color', colour);
      badge.style.setProperty('color', textColour);
    };
</script>

{#if $station.status === 'open'}
  {#if $station.departures.status !== 'asked'}
    <section aria-labelledby="{uid}-departures">
      <h3 id="{uid}-departures">{m.station_departures()}</h3>
      {#if $station.departures.status === 'unavailable'}
        <p class="empty">{m.station_departures_unavailable()}</p>
      {:else if $station.departures.lines.length === 0}
        <p class="empty">{m.station_departures_none()}</p>
      {:else}
        <ul class="departures">
          {#each $station.departures.lines as line (`${line.ref}|${line.destination}`)}
            <li>
              <span
                class={['badge', line.mode === 'subway' && 'round']}
                role="img"
                aria-label={lineName(line)}
                {@attach coloured(line.colour, line.textColour)}
                >{line.ref}</span
              >
              <span class="destination">{line.destination}</span>
              <span class="times">
                {#if line.live}
                  <span class="live" role="img" aria-label={m.station_real_time()}></span>
                {/if}
                {#each line.times as time, index (index)}
                  {#if index === 0}
                    <strong>{toldText(time, locale)}</strong>
                  {:else}
                    <span class="next">{toldText(time, locale)}</span>
                  {/if}
                {/each}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
  {#if $station.exits.length > 0}
    <section aria-labelledby="{uid}-exits">
      <h3 id="{uid}-exits">{m.station_exits()}</h3>
      <ul class="exits">
        {#each cut($station.id, $station.exits.length)
          ? $station.exits.slice(0, FIRST_EXITS)
          : $station.exits as exit, index (index)}
          <li>
            <button type="button" onclick={(): void => onExit(exit.coordinates)}>
              <span class="square" aria-hidden="true"></span>
              <span class="exit">{exitText(exit)}</span>
              <span class="access">{accessText(exit)}</span>
            </button>
          </li>
        {/each}
      </ul>
      {#if cut($station.id, $station.exits.length)}
        <button type="button" class="all" onclick={(): void => opened.next($station.id)}>
          {m.station_all_exits({ count: $station.exits.length })}
        </button>
      {/if}
    </section>
  {/if}
{/if}

<style>
  section {
    margin-block-start: 1.375rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text);
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .empty {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text-muted);
    text-wrap: pretty;
  }

  .departures li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.625rem;
    align-items: center;
    min-block-size: 3rem;
    border-block-end: 1px solid var(--line);
  }

  .badge {
    display: inline-grid;
    place-items: center;
    min-inline-size: 1.625rem;
    block-size: 1.5rem;
    padding: 0 0.4375rem;
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    border-radius: 0.4375rem;
  }

  .badge.round {
    inline-size: 1.625rem;
    min-inline-size: 1.625rem;
    block-size: 1.625rem;
    padding: 0;
    border-radius: 50%;
  }

  .destination {
    font-size: 0.9375rem;
    color: var(--text);
    overflow-wrap: anywhere;
  }

  .times {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    white-space: nowrap;
  }

  .times strong {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--open);
  }

  .next {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .next::before {
    content: "· ";
  }

  .live {
    inline-size: 0.4375rem;
    block-size: 0.4375rem;
    margin-inline-end: 0.125rem;
    background: var(--open);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live {
      animation: none;
    }
  }

  .exits button {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.625rem;
    align-items: center;
    inline-size: 100%;
    min-block-size: 2.75rem;
    padding: 0;
    font: inherit;
    font-size: 0.9375rem;
    color: var(--text);
    text-align: start;
    cursor: pointer;
    background: none;
    border: 0;
    border-block-end: 1px solid var(--line);
  }

  .square {
    inline-size: 0.75rem;
    block-size: 0.75rem;
    background: var(--exit);
    border-radius: 0.1875rem;
  }

  .exit {
    overflow-wrap: anywhere;
  }

  .access {
    font-size: 0.84375rem;
    color: var(--text-muted);
  }

  .all {
    min-block-size: 2.75rem;
    padding: 0;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: 0;
  }
</style>
