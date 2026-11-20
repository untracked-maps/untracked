<script lang="ts">
  import { type Observable, Subject } from 'rxjs';
  import type { Snippet } from 'svelte';
  import {
    isDragged,
    SHEET_GRIPPED,
    SHEET_WHEELED,
    type Sheet,
    type SheetEvent,
    sheetClosed,
    sheetHeight,
    sheetMeasured,
    sheetMoved,
    sheetOf,
    sheetOpened,
    sheetReleased,
    sheetTouched
  } from './sheet-gesture';
  import { hasGrip, type SheetStop, sheetHeights } from './sheet-heights';
  import './tokens.css';

  type Props = {
    readonly children: Snippet;
    readonly growLabel: string;
    readonly reduceLabel: string;
    readonly opening?: SheetStop;
    readonly subject?: unknown;
    readonly covered?: boolean;
    readonly onHeight?: ((height: number) => void) | undefined;
    readonly onClose?: () => void;
  };

  type Touching = TouchEvent & { readonly currentTarget: HTMLElement };

  const { children, growLabel, reduceLabel, opening = 'half', subject, covered = false, onHeight, onClose }: Props = $props();

  const PHONE = '(max-width: 699px) and (orientation: portrait), (max-width: 559px)';

  const PEEK_GAP = 6;

  const events = new Subject<SheetEvent>();

  const sheet: Observable<Sheet> = sheetOf(events);

  const height = $derived(sheetHeight($sheet));

  const reopen = (stop: SheetStop, _content: unknown): void => events.next(sheetOpened(stop));

  const heightOnPhone = (visible: number): number => (matchMedia(PHONE).matches ? visible : 0);

  $effect(() => reopen(opening, subject));

  $effect(() => {
    onHeight?.(heightOnPhone(covered ? 0 : height));
    return (): void => onHeight?.(0);
  });

  $effect(() => {
    const closing = sheetClosed(sheet).subscribe(onClose);
    return closing.unsubscribe.bind(closing);
  });

  const measure = (content: HTMLElement) => (): void => {
    const actions = content.querySelector('[data-sheet-actions]');
    const peekEnd =
      actions === null ? undefined : actions.getBoundingClientRect().top - content.getBoundingClientRect().top - PEEK_GAP;
    events.next(sheetMeasured(sheetHeights({ content: content.offsetHeight, viewport: innerHeight, peekEnd })));
  };

  const measured = (content: HTMLElement): (() => void) => {
    const observer = new ResizeObserver(measure(content));
    observer.observe(content);
    observer.observe(document.documentElement);
    return observer.disconnect.bind(observer);
  };

  const touched = (event: Touching): void => {
    const [touch, second] = event.touches;
    if (touch !== undefined && second === undefined) {
      events.next(
        sheetTouched(touch, {
          time: event.timeStamp,
          sideways: event.target instanceof Element && event.target.closest('[data-sheet-sideways]') !== null,
          scrolled: event.currentTarget.scrollTop > 0
        })
      );
    }
  };

  const moved = (event: TouchEvent): void => {
    const [touch] = event.touches;
    if (touch !== undefined) {
      events.next(sheetMoved(touch));
    }
  };

  const released = (event: TouchEvent): void => events.next(sheetReleased(event.timeStamp, onClose !== undefined));

  const grip = (): void => events.next(SHEET_GRIPPED);

  const wheel = (event: WheelEvent): void => {
    if (event.deltaY > 0) {
      events.next(SHEET_WHEELED);
    }
  };

  const sized =
    (pixels: number) =>
    (element: HTMLElement): void =>
      element.style.setProperty('--sheet-height', `${pixels}px`);

  const unscrolled =
    (scrolls: boolean) =>
    (scroller: HTMLElement): void => {
      if (!scrolls) {
        scroller.scrollTo({ top: 0 });
      }
    };
</script>

<div
  class={['sheet', isDragged($sheet) && 'dragged', $sheet.closing && 'closing', covered && 'covered', height === 0 && 'shut']}
  {@attach sized(height)}
>
  <div
    class={['scroller', $sheet.stop === 'full' && 'scrolls']}
    role="presentation"
    ontouchstart={touched}
    ontouchmove={moved}
    ontouchend={released}
    ontouchcancel={released}
    onwheel={wheel}
    {@attach unscrolled($sheet.stop === 'full')}
  >
    <div class="content" {@attach measured}>
      <div class="zone">
        {#if hasGrip($sheet.heights)}
          <button
            type="button"
            class="grip"
            aria-label={$sheet.stop === 'full' ? reduceLabel : growLabel}
            onclick={grip}
          ></button>
        {/if}
      </div>
      {@render children()}
    </div>
  </div>
</div>

<style>
  .sheet {
    --sheet-height: 0;

    pointer-events: auto;
  }

  .zone {
    display: none;
  }

  @media (width <= 699px) and (orientation: portrait), (width <= 559px) {
    .sheet {
      position: fixed;
      inset-block-end: 0;
      inset-inline: 0;
      z-index: 3;
      block-size: var(--sheet-height);
      overflow: hidden;
      color: var(--text);
      background: var(--surface);
      border-radius: 1.625rem 1.625rem 0 0;
      box-shadow: var(--shadow-float);
      transition: block-size 280ms cubic-bezier(0.2, 0.9, 0.25, 1);
      animation: sheet-in 280ms cubic-bezier(0.2, 0.9, 0.25, 1);
    }

    .dragged {
      transition: none;
    }

    .closing {
      transition: block-size 200ms ease-in;
    }

    .covered {
      visibility: hidden;
    }

    .shut {
      box-shadow: none;
    }

    .zone {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      display: grid;
      place-items: center;
      block-size: 1.875rem;
      background: var(--surface);
    }

    .grip {
      display: grid;
      place-items: center;
      inline-size: 100%;
      block-size: 100%;
      padding: 0;
      cursor: pointer;
      background: none;
      border: 0;
    }

    .grip::before {
      inline-size: 2.25rem;
      block-size: 0.3125rem;
      content: "";
      background: var(--grip);
      border-radius: var(--radius-full);
    }

    .scroller {
      block-size: 100%;
      overflow: hidden;
      touch-action: none;
    }

    .scrolls {
      overflow-y: auto;
      overscroll-behavior: contain;
      touch-action: pan-y;
    }

    .content {
      padding-block-end: env(safe-area-inset-bottom);
    }

    .content :global(.floating) {
      padding-block-start: 0;
      background: none;
      border-radius: 0;
      box-shadow: none;
    }
  }

  @keyframes sheet-in {
    from {
      opacity: 0.4;
      translate: 0 60px;
    }
  }
</style>
