<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly href: string;
    readonly hreflang?: string;
    readonly reload?: boolean;
    readonly external?: boolean;
    readonly tone?: 'soft' | 'strong';
  };

  const { children, href, hreflang, reload = false, external = false, tone = 'strong' }: Props = $props();
</script>

<a class={tone} {href} {hreflang} rel={external ? 'external' : undefined} data-sveltekit-reload={reload ? '' : 'off'}
  >{@render children()}</a
>

<style>
  a {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
    justify-content: center;
    min-block-size: var(--control-height);
    padding: 0 var(--space-4);
    font-weight: var(--font-weight-strong);
    text-decoration: none;
    border-radius: var(--radius-full);
  }

  .strong {
    color: var(--text-on-accent);
    background: var(--accent-strong);
  }

  .soft {
    color: var(--accent);
    background: var(--accent-soft);
  }
</style>
