<script lang="ts">
  import type { Observable } from 'rxjs';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/tokens.css';
  import type { Notice } from '../../domain/show-notice';

  type Props = {
    readonly shown: Observable<Notice | undefined>;
    readonly onAct: () => void;
  };

  const { shown, onAct }: Props = $props();

  const act = (run: () => void) => (): void => {
    run();
    onAct();
  };
</script>

<div role="status">
  {#if $shown !== undefined}
    <Floating>
      <div class="notice">
        <p>{$shown.text}</p>
        {#if $shown.action !== undefined}
          <button type="button" onclick={act($shown.action.run)}>{$shown.action.label}</button>
        {/if}
      </div>
    </Floating>
  {/if}
</div>

<style>
  [role="status"] > :global(*) {
    padding-inline-end: var(--space-3);
    animation: drop-in 0.22s ease-out;
  }

  .notice {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    font-size: 0.90625rem;
    line-height: 1.35;
  }

  p {
    margin: 0;
  }

  button {
    flex: none;
    min-block-size: 2.25rem;
    padding: 0 var(--space-4);
    font-size: 0.875rem;
    font-weight: var(--font-weight-strong);
    color: var(--accent);
    cursor: pointer;
    background: var(--accent-soft);
    border: 0;
    border-radius: 1.125rem;
  }

  @keyframes drop-in {
    from {
      opacity: 0;
      translate: 0 -8px;
    }
  }
</style>
