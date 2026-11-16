<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly tone?: 'surface' | 'inverse';
  };

  const { children, tone = 'surface' }: Props = $props();

  const classes = $derived(`floating ${tone}`);
</script>

<div class={classes}>
  {@render children()}
</div>

<style>
  .floating {
    position: relative;
    box-sizing: border-box;
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-body);
    pointer-events: auto;
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-float);
  }

  .surface {
    color: var(--text);
    background: var(--surface);
  }

  .inverse {
    color: var(--text-on-inverse);
    background: var(--surface-inverse);
  }
</style>
