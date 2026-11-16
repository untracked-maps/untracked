<script lang="ts">
  import './tokens.css';

  type Link = {
    readonly href: string;
    readonly text: string;
    readonly current: boolean;
    readonly lang?: string;
  };

  type Props = {
    readonly label: string;
    readonly links: readonly Link[];
    readonly reload?: boolean;
  };

  const { label, links, reload = false }: Props = $props();
</script>

<nav aria-label={label}>
  <ul>
    {#each links as { href, text, current, lang } (href)}
      <li>
        <a {href} hreflang={lang} {lang} aria-current={current ? 'page' : undefined} data-sveltekit-reload={reload ? '' : 'off'}
          >{text}</a
        >
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    position: relative;
    padding: var(--space-1);
    pointer-events: auto;
    background: var(--surface);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-float);
  }

  ul {
    display: flex;
    gap: var(--space-1);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  a {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-height);
    padding-inline: var(--space-4);
    color: var(--text);
    text-decoration: none;
    border-radius: var(--radius-full);
  }

  a[aria-current="page"] {
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    background: var(--accent-soft);
  }
</style>
