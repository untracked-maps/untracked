<script lang="ts">
  import { distinctUntilChanged, filter, map, merge, type Observable, Subject } from 'rxjs';
  import { innerHeight } from 'svelte/reactivity/window';
  import { m } from '#i18n/messages';
  import { type Closable, closedWhenAsked, followed, NEVER_ASKED, toggleTold } from '#libraries/design/closable';
  import CloseIcon from '#libraries/design/close-icon.svelte';
  import '#libraries/design/tokens.css';
  import '../../../../ui/components/viewer-frame.css';
  import { fadeAfter, touchPoints } from '../../../../ui/components/swipe-down';
  import type { StreetView } from '../../domain/show-street-view';
  import { type StreetGesture, type StreetGestureEvent, streetGesture } from './street-gesture';
  import { thumbShown } from './thumb-shown';

  type Props = {
    readonly view: Observable<StreetView>;
    readonly sheetHeight: Observable<number>;
    readonly source: (path: string) => string;
    readonly closable?: Closable;
  };

  const { view, sheetHeight, source, closable = NEVER_ASKED }: Props = $props();

  const uid = $props.id();

  type Touching = TouchEvent & { readonly currentTarget: HTMLDialogElement };

  const opening = new Subject<void>();

  const gestures = new Subject<StreetGestureEvent>();

  const gesture = streetGesture(gestures);

  const facingAt =
    (facing: number) =>
    (element: HTMLElement): void =>
      element.style.setProperty('--facing', `${facing}`);

  const opensAt = (facing: number): ((dialog: HTMLDialogElement) => () => void) =>
    followed(opening, (dialog: HTMLDialogElement) => {
      dialog.showModal();
      const pano = dialog.querySelector('.pano');
      pano?.scrollTo({ left: facing * pano.scrollWidth - pano.clientWidth / 2, behavior: 'instant' });
    });

  const touched = (event: Touching): void => gestures.next({ kind: 'touched', points: touchPoints(event.touches) });

  const moved = (event: TouchEvent): void => gestures.next({ kind: 'moved', points: touchPoints(event.touches) });

  const released = (): void => gestures.next({ kind: 'released' });

  const toggled = (event: ToggleEvent): void => {
    gestures.next({ kind: 'reset' });
    toggleTold(closable)(event);
  };

  const dropped =
    ({ drop }: StreetGesture) =>
    (dialog: HTMLDialogElement): void => {
      dialog.style.setProperty('--drop', `${drop}px`);
      dialog.style.setProperty('--fade', `${fadeAfter(drop)}`);
    };

  const closings = $derived(
    merge(
      closable.closings,
      gesture.pipe(
        map(({ closing }) => closing),
        distinctUntilChanged(),
        filter(Boolean)
      )
    )
  );
</script>

{#if $view.status === 'shown'}
  {#if thumbShown($sheetHeight, Number(innerHeight.current))}
    <button
      type="button"
      class="thumb"
      aria-label={m.street_view_open()}
      aria-haspopup="dialog"
      onclick={(): void => opening.next()}
      {@attach facingAt($view.facing)}
    >
      <img src={source($view.image)} alt={m.street_view_front({ nom: $view.name })} decoding="async" />
      <span class="badge">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4.5 12a7.5 3.5 0 1 0 15 0M17 9.5l2.5 2.5 2.5-2.5" />
          <circle cx="12" cy="12" r="1.6" class="solid" />
        </svg>
      </span>
    </button>
  {/if}
  <dialog
    id="{uid}-street"
    class={['viewer-frame', $gesture.swipe === 'dropping' && 'dropping']}
    aria-label={m.street_view({ nom: $view.name })}
    closedby="any"
    onbeforetoggle={toggled}
    ontouchstart={touched}
    ontouchmove={moved}
    ontouchend={released}
    ontouchcancel={released}
    {@attach opensAt($view.facing)}
    {@attach closedWhenAsked(closings, (dialog: HTMLDialogElement): void => dialog.close())}
    {@attach dropped($gesture)}
  >
    <p class="viewer-top">{m.street_view_help()}</p>
    <button
      type="button"
      class="viewer-round viewer-close"
      aria-label={m.place_photos_close()}
      commandfor="{uid}-street"
      command="close"
    >
      <CloseIcon />
    </button>
    <div class="pano">
      <img
        src={source($view.image)}
        alt={m.street_view_image({ nom: $view.name })}
        width="2000"
        height="1000"
        decoding="async"
      />
    </div>
    <p class="viewer-credit">{m.place_photos_credit()}</p>
  </dialog>
{/if}

<style>
  .thumb {
    --facing: 0.5;
    position: relative;
    box-sizing: border-box;
    inline-size: 7rem;
    block-size: 4.75rem;
    padding: 0;
    overflow: hidden;
    pointer-events: auto;
    cursor: pointer;
    background: var(--surface-sunken);
    border: 2.5px solid rgb(255 255 255);
    border-radius: 14px;
    box-shadow: var(--shadow-float);
    animation: appear-thumb 200ms ease-out;
  }

  .thumb img {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inline-size: 600%;
    max-inline-size: none;
    block-size: auto;
    translate: calc(var(--facing) * -100%) -50%;
  }

  .thumb:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .badge {
    position: absolute;
    inset-block-end: 5px;
    inset-inline-start: 5px;
    display: grid;
    place-items: center;
    inline-size: 22px;
    block-size: 22px;
    background: rgb(0 0 0 / 0.55);
    border-radius: 50%;
  }

  .badge svg {
    inline-size: 16px;
    block-size: 16px;
    fill: none;
    stroke: rgb(255 255 255);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .badge .solid {
    fill: rgb(255 255 255);
    stroke: none;
  }

  @keyframes appear-thumb {
    from {
      opacity: 0;
      scale: 0.92;
    }
  }

  .pano {
    position: absolute;
    inset-block-start: 50%;
    inset-inline: 0;
    overflow-x: auto;
    overscroll-behavior: contain;
    touch-action: pan-x;
    scrollbar-width: none;
    opacity: var(--fade);
    translate: 0 calc(-50% + var(--drop));
    transition:
      translate 0.2s ease,
      opacity 0.2s ease;
  }

  .dropping .pano {
    overflow-x: hidden;
    touch-action: none;
    transition: none;
  }

  .pano img {
    display: block;
    inline-size: auto;
    max-inline-size: none;
    block-size: min(100vh, 50vw);
  }

  @media (orientation: portrait) {
    .pano img {
      block-size: 60vh;
    }
  }

  @media (width >= 700px) {
    .thumb {
      inline-size: 10rem;
      block-size: 6.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .thumb {
      animation: none;
    }

    .pano {
      transition: none;
    }
  }
</style>
