<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type FloatMeasures, floatLift } from './float-lift';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly bottom: Snippet;
    readonly sheetHeight?: number;
  };

  const { children, bottom, sheetHeight = 0 }: Props = $props();

  const boxesOf = (frame: HTMLElement, selector: string): readonly DOMRect[] =>
    [...frame.querySelectorAll(selector)].map((element) => element.getBoundingClientRect());

  const measuresOf = (frame: HTMLElement) => (): FloatMeasures => {
    const stack = boxesOf(frame, '[data-sheet-stack]');
    return {
      stackHeight: Math.max(...stack.map(({ bottom: end }) => end)) - Math.min(...stack.map(({ top }) => top)),
      viewportHeight: innerHeight,
      topBarBottom: Math.max(0, ...boxesOf(frame, '[data-sheet-top]').map(({ bottom: end }) => end)),
      inset: Number.parseFloat(getComputedStyle(frame).paddingBlockEnd)
    };
  };

  const lifted =
    (height: number) =>
    (frame: HTMLElement): void => {
      const { offset, hidden } = floatLift(height, measuresOf(frame));
      frame.style.setProperty('--lift', `${offset}`);
      frame.toggleAttribute('data-floats-hidden', hidden);
    };
</script>

<div class="frame" {@attach lifted(sheetHeight)}>
  <main>{@render children()}</main>
  <footer data-sheet-stack>{@render bottom()}</footer>
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

  .frame:global([data-floats-hidden]) {
    --floats: hidden;
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
    visibility: var(--floats);
    gap: var(--space-3);
    align-items: flex-end;
    justify-content: flex-end;
    translate: 0 calc(var(--lift) * -1px);
    transition: translate 0.2s ease;
  }
</style>
