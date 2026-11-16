<script lang="ts">
  import ClockIcon from '#libraries/design/clock-icon.svelte';
  import Suggestion from '#libraries/design/suggestion.svelte';
  import '#libraries/design/tokens.css';
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { detailsOf } from '../../../../ui/components/kind-labels';
  import type { RecentPlace, RecentPlaces } from '../../domain/recent-searches';

  type Props = {
    readonly recents: Observable<RecentPlaces>;
    readonly onChoose: (recent: RecentPlace) => void;
    readonly onClear: () => void;
  };

  const { recents, onChoose, onClear }: Props = $props();

  const uid = $props.id();

  const choose = (recent: RecentPlace) => (): void => onChoose(recent);
</script>

{#if $recents.length > 0}
  <section aria-labelledby="{uid}-title">
    <div class="heading">
      <h2 id="{uid}-title">{m.recent_searches_title()}</h2>
      <button type="button" class="clear" onclick={onClear}>{m.recent_searches_clear()}</button>
    </div>
    <ul>
      {#each $recents as recent (recent.id)}
        <li>
          <button type="button" class="recent" onclick={choose(recent)}>
            <Suggestion name={recent.name} details={detailsOf(recent)}>
              {#snippet icon()}
                <ClockIcon />
              {/snippet}
            </Suggestion>
          </button>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .heading {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4) var(--space-1) var(--control-size);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-body);
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  button {
    padding: 0;
    cursor: pointer;
    background: none;
    border: 0;
  }

  button:focus-visible {
    outline-offset: -3px;
  }

  .clear {
    min-block-size: 1.5rem;
    font-weight: var(--font-weight-strong);
    color: var(--accent);
  }

  .recent {
    display: block;
    inline-size: 100%;
  }
</style>
