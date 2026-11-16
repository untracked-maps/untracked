<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly bottom: Snippet;
  };

  const { children, bottom }: Props = $props();
</script>

<div class="frame">
  <main>{@render children()}</main>
  <footer>{@render bottom()}</footer>
</div>

<style>
  .frame {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: var(--space-3);
    min-block-size: 100dvh;
    padding: max(var(--edge), env(safe-area-inset-top)) max(var(--edge), env(safe-area-inset-right))
      max(var(--edge), env(safe-area-inset-bottom)) max(var(--edge), env(safe-area-inset-left));
    pointer-events: none;
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
    gap: var(--space-3);
    align-items: flex-end;
    justify-content: flex-end;
  }
</style>
