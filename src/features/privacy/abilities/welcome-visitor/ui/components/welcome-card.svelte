<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import Button from '#libraries/design/button.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import LockIcon from '#libraries/design/lock-icon.svelte';
  import '#libraries/design/tokens.css';

  type Props = {
    readonly welcome: Observable<boolean>;
    readonly privacyHref: string;
    readonly onAcknowledge: () => void;
  };

  const { welcome, privacyHref, onAcknowledge }: Props = $props();

  const uid = $props.id();
</script>

{#if $welcome}
  <section aria-labelledby="{uid}-title">
    <Floating>
      <h2 id="{uid}-title"><LockIcon />{m.welcome_title()}</h2>
      <p>{m.welcome_text()}</p>
      <ul>
        <li>{m.welcome_no_tracker()}</li>
        <li>{m.welcome_no_cookie()}</li>
        <li>{m.welcome_open_source()}</li>
      </ul>
      <div class="actions">
        <p class="more">{m.welcome_learn_more()} <a href={privacyHref}>{m.privacy_title()}</a></p>
        <Button tone="strong" onclick={onAcknowledge}>{m.welcome_acknowledge()}</Button>
      </div>
    </Floating>
  </section>
{/if}

<style>
  section {
    inline-size: 100%;
    max-inline-size: 26rem;
  }

  :global(:root[data-welcomed]) section {
    display: none;
  }

  section > :global(*) {
    padding: var(--space-4);
    border-radius: var(--radius-l);
  }

  h2 {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    margin-block-end: var(--space-2);
    font-size: var(--font-size-lead);
    color: var(--text);
  }

  h2 :global(svg) {
    inline-size: 1.375rem;
    block-size: 1.375rem;
    color: var(--accent);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: 0;
    margin: 0 0 var(--space-3);
    list-style: none;
  }

  li {
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    background: var(--accent-soft);
    border-radius: var(--radius-full);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    align-items: center;
    justify-content: space-between;
  }

  .more {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  a {
    display: inline-flex;
    align-items: center;
    min-block-size: 1.5rem;
    font-weight: var(--font-weight-strong);
  }
</style>
