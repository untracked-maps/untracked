<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly href: string;
    readonly hreflang?: string;
    readonly reload?: boolean;
  };

  const { children, href, hreflang, reload = false }: Props = $props();
</script>

<a {href} {hreflang} data-sveltekit-reload={reload ? '' : 'off'}>{@render children()}</a>

<style>
  a {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-height);
    padding: 0 var(--space-4);
    font-weight: var(--font-weight-strong);
    color: var(--text-on-accent);
    text-decoration: none;
    background: var(--accent-strong);
    border-radius: var(--radius-full);
  }
</style>
