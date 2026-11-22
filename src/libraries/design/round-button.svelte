<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly label: string;
    readonly children: Snippet;
    readonly onclick?: (() => void) | undefined;
    readonly commandfor?: string | undefined;
    readonly command?: 'close' | undefined;
  };

  const { label, children, onclick, commandfor, command }: Props = $props();
</script>

<button type="button" aria-label={label} {commandfor} {command} {onclick}>
  {@render children()}
</button>

<style>
  button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    padding: 0;
    color: var(--text-muted);
    cursor: pointer;
    background: var(--surface-sunken);
    border: 0;
    border-radius: 50%;
  }
</style>
