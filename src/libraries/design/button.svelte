<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly onclick: () => void;
    readonly tone?: 'soft' | 'strong';
  };

  const { children, onclick, tone = 'soft' }: Props = $props();
</script>

<button type="button" class={tone} {onclick}>{@render children()}</button>

<style>
  button {
    min-block-size: var(--control-height);
    padding: 0 var(--space-4);
    font-weight: var(--font-weight-strong);
    cursor: pointer;
    border: 0;
    border-radius: var(--radius-full);
  }

  .soft {
    color: var(--accent);
    background: var(--accent-soft);
  }

  .strong {
    padding: 0 var(--space-5);
    color: var(--text-on-accent);
    background: var(--accent-strong);
  }
</style>
