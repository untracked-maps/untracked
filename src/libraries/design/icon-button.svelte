<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly label: string;
    readonly onclick: () => void;
  };

  const { children, label, onclick }: Props = $props();
</script>

<button type="button" aria-label={label} {onclick}>{@render children()}</button>

<style>
  button {
    position: relative;
    display: grid;
    flex-shrink: 0;
    place-items: center;
    inline-size: var(--control-size);
    block-size: var(--control-size);
    padding: 0;
    color: var(--accent);
    pointer-events: auto;
    cursor: pointer;
    background: var(--surface);
    border: 0;
    border-radius: 50%;
    box-shadow: var(--shadow-float);
  }
</style>
