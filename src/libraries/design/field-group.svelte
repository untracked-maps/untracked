<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly legend: string;
    readonly layout?: 'row';
    readonly children: Snippet;
  };

  const { legend, layout, children }: Props = $props();
</script>

<fieldset class={layout}>
  <legend>{legend}</legend>
  {@render children()}
</fieldset>

<style>
  fieldset {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    align-items: center;
    justify-content: space-between;
  }

  legend {
    float: inline-start;
    padding: 0;
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
  }
</style>
