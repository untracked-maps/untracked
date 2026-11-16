<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import IconButton from '#libraries/design/icon-button.svelte';
  import LocateIcon from '#libraries/design/locate-icon.svelte';
  import '#libraries/design/tokens.css';
  import type { LocateMeStatus } from '../../domain/locate-me';

  type Props = {
    readonly status: Observable<LocateMeStatus>;
    readonly onLocate: () => void;
  };

  const { status, onLocate }: Props = $props();

  const MESSAGES: Readonly<Record<LocateMeStatus['kind'], () => string>> = {
    locating: m.locate_me_locating,
    located: m.locate_me_located,
    'permission-denied': m.locate_me_permission_denied,
    'position-unavailable': m.locate_me_position_unavailable
  };
</script>

<div>
  <p role="status">
    {#if $status}
      {MESSAGES[$status.kind]()}
    {/if}
  </p>
  <IconButton label={m.locate_me()} onclick={onLocate}><LocateIcon /></IconButton>
</div>

<style>
  div {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    justify-content: flex-end;
  }

  p {
    position: relative;
    max-inline-size: 22rem;
    padding: var(--space-2) var(--space-3);
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--text);
    pointer-events: auto;
    background: var(--surface);
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-float);
  }

  p:empty {
    padding: 0;
    box-shadow: none;
  }
</style>
