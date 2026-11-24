<script lang="ts">
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
  import { goodToKnowOf } from '../../domain/good-to-know';
  import type { SheetPlace } from '../../domain/open-place';
  import { labelOf } from './good-to-know.presenter';

  type Props = {
    readonly place: SheetPlace;
  };

  const { place }: Props = $props();

  const uid = $props.id();

  const facts = $derived(goodToKnowOf(place.tags));
</script>

{#if facts.length > 0}
  <section aria-labelledby="{uid}-good-to-know">
    <h3 id="{uid}-good-to-know">{m.place_sheet_good_to_know()}</h3>
    <ul>
      {#each facts as { fact, sign } (fact)}
        <li>
          <svg class={sign} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {#if sign === 'yes'}
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            {:else}
              <path d="M7 7l10 10M17 7 7 17" />
            {/if}
          </svg>
          {labelOf(fact)}
        </li>
      {/each}
    </ul>
  </section>
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 0.75rem;
    padding: 0.75rem 0.875rem;
    margin: 0;
    font-size: 0.90625rem;
    color: var(--text);
    list-style: none;
    background: var(--surface-sunken);
    border-radius: 0.875rem;
  }

  li {
    display: flex;
    gap: 0.4375rem;
    align-items: center;
  }

  svg {
    flex-shrink: 0;
    inline-size: 1rem;
    block-size: 1rem;
    fill: none;
    stroke: currentcolor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .yes {
    color: light-dark(rgb(24 132 61), rgb(76 196 107));
  }

  .no {
    color: light-dark(rgb(197 34 31), rgb(255 107 97));
  }
</style>
