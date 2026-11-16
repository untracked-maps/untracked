<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly top: Snippet;
    readonly children: Snippet;
    readonly bottom: Snippet;
  };

  const { top, children, bottom }: Props = $props();
</script>

<div class="frame">
  <div class="top">{@render top()}</div>
  <main>{@render children()}</main>
  <footer>{@render bottom()}</footer>
</div>

<style>
  .frame {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: var(--space-3);
    min-block-size: 100dvh;
    padding: max(var(--edge), env(safe-area-inset-top)) max(var(--edge), env(safe-area-inset-right))
      max(var(--edge), env(safe-area-inset-bottom)) max(var(--edge), env(safe-area-inset-left));
    pointer-events: none;
  }

  @media (width < 700px) {
    .frame {
      padding-block-end: calc(max(var(--edge), env(safe-area-inset-bottom)) + var(--map-credit-height));
    }
  }

  .top {
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: flex-start;
    justify-content: flex-end;
  }

  main {
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  footer {
    z-index: 2;
    display: flex;
    align-items: flex-end;
  }
</style>
