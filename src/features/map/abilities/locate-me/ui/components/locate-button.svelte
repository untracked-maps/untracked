<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
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
  <button type="button" aria-label={m.locate_me()} onclick={onLocate}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4 4 11l7 2 2 7z" /></svg>
  </button>
</div>

<style>
  div {
    position: fixed;
    inset-block-end: 3rem;
    inset-inline-end: 0.75rem;
    z-index: 1;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    max-inline-size: calc(100% - 1.5rem);
  }

  p {
    padding: 0.25rem 0.5rem;
    margin: 0;
    background: Canvas;
  }

  p:empty {
    padding: 0;
  }

  button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    inline-size: 48px;
    block-size: 48px;
    padding: 0;
    color: ButtonText;
    cursor: pointer;
    background: ButtonFace;
    border: 1px solid ButtonBorder;
    border-radius: 50%;
  }

  svg {
    inline-size: 22px;
    block-size: 22px;
    fill: currentcolor;
  }
</style>
