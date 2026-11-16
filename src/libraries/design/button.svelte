<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly onclick: () => void;
  };

  const { children, onclick }: Props = $props();
</script>

<button type="button" {onclick}>{@render children()}</button>

<style>
  button {
    min-block-size: var(--control-height);
    padding: 0 var(--space-4);
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    cursor: pointer;
    background: var(--accent-soft);
    border: 0;
    border-radius: var(--radius-full);
  }
</style>
