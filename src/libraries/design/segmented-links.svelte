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

  const uid = $props.id();
</script>

<nav aria-labelledby="{uid}-label">
  <span id="{uid}-label">{label}</span>
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
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    align-items: center;
    justify-content: space-between;
  }

  span {
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
  }

  ul {
    display: flex;
    gap: 2px;
    padding: 2px;
    margin: 0;
    list-style: none;
    border: 1px solid var(--line);
    border-radius: var(--radius-full);
  }

  a {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--segment-height);
    padding-inline: var(--space-3);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    color: var(--text);
    text-decoration: none;
    border-radius: var(--radius-full);
  }

  a[aria-current="page"] {
    color: var(--text-on-accent);
    background: var(--accent-strong);
  }

  @media (forced-colors: active) {
    a[aria-current="page"] {
      color: SelectedItemText;
      forced-color-adjust: none;
      background: SelectedItem;
    }
  }
</style>
