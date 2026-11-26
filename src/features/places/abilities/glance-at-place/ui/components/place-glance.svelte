<script lang="ts">
  import type { Observable } from 'rxjs';
  import type { Snippet } from 'svelte';
  import { m } from '#i18n/messages';
  import { getLocale } from '#i18n/runtime';
  import '#libraries/design/tokens.css';
  import type { Glance } from '../../domain/glance-at-place';
  import { toldOf } from './place-glance.presenter';

  type Props = {
    readonly glance: Observable<Glance>;
    readonly hours?: Snippet;
    readonly locale?: string;
  };

  const { glance, hours, locale = getLocale() }: Props = $props();
</script>

{#if $glance.columns.length > 0}
  <dl aria-label={m.place_glance()}>
    {#each $glance.columns as column (column.kind)}
      {#if column.kind === 'hours'}
        {@render hours?.()}
      {:else}
        <div>
          <dt>{toldOf(column, locale).label}</dt>
          <dd>{toldOf(column, locale).value}</dd>
        </div>
      {/if}
    {/each}
  </dl>
{/if}

<style>
  dl {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    margin: 0.875rem 0 0;
    color: var(--text);
    text-align: center;
  }

  dl > :global(div) {
    min-inline-size: 0;
    padding: 0 0.375rem;
  }

  dl > :global(div + div) {
    border-inline-start: 1px solid var(--line);
  }

  dl :global(dt) {
    font-size: 0.78125rem;
    color: var(--text-muted);
  }

  dl :global(dd) {
    margin: 0;
    font-size: 1rem;
    font-weight: 650;
  }

  dl :global(dd + dd) {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
    color: var(--text-muted);
    text-wrap: balance;
  }
</style>
