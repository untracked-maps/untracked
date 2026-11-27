<script lang="ts">
  import { distinctUntilChanged, filter, map, merge, type Observable, Subject, shareReplay, startWith } from 'rxjs';
  import { m } from '#i18n/messages';
  import { type Closable, closedWhenAsked, NEVER_ASKED, toggleTold } from '#libraries/design/closable';
  import CloseIcon from '#libraries/design/close-icon.svelte';
  import '#libraries/design/tokens.css';
  import type { Photos } from '../../domain/show-photos';
  import { fadeOf, type GestureEvent, isZoomed, type PhotoGesture, type Point, photoGesture } from './photo-gesture';

  type Props = {
    readonly photos: Photos;
    readonly name: string;
    readonly source: (path: string) => string;
    readonly opening: Observable<number>;
    readonly closable?: Closable;
  };

  const { photos, name, source, opening, closable = NEVER_ASKED }: Props = $props();

  const uid = $props.id();

  type Scrolling = Event & { readonly currentTarget: HTMLElement };

  type Touching = TouchEvent & { readonly currentTarget: HTMLDialogElement };

  const STEPS: ReadonlyMap<string, number> = new Map([
    ['ArrowLeft', -1],
    ['ArrowRight', 1]
  ]);

  const scrolls = new Subject<number>();

  type Move = { readonly index: number; readonly scrolling: ScrollBehavior };

  const moves = new Subject<Move>();

  const gestures = new Subject<GestureEvent>();

  const shown = $derived(merge(opening, scrolls).pipe(startWith(0), distinctUntilChanged(), shareReplay(1)));

  const gesture = $derived(photoGesture(merge(gestures, shown.pipe(map((): GestureEvent => ({ kind: 'reset' }))))));

  const behaviour = (): ScrollBehavior => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');

  const stepped = (index: number): void => moves.next({ index, scrolling: behaviour() });

  const opensAt =
    (openings: Observable<number>) =>
    (dialog: HTMLDialogElement): (() => void) => {
      const subscription = openings.subscribe((index) => {
        dialog.showModal();
        moves.next({ index, scrolling: 'instant' });
      });
      return (): void => subscription.unsubscribe();
    };

  const movedBy =
    (wanted: Observable<Move>) =>
    (track: HTMLElement): (() => void) => {
      const subscription = wanted.subscribe(({ index, scrolling }) =>
        track.scrollTo({ left: index * track.clientWidth, behavior: scrolling })
      );
      return (): void => subscription.unsubscribe();
    };

  const closed = (dialog: HTMLDialogElement): void => dialog.close();

  const toggled = (event: ToggleEvent): void => {
    toggleTold(closable)(event);
    gestures.next({ kind: 'reset' });
  };

  const scrolled = (event: Scrolling): void => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    scrolls.next(Math.round(scrollLeft / clientWidth));
  };

  const pointsOf = (touches: TouchList): readonly Point[] =>
    Array.from(touches, (touch) => ({ x: touch.clientX, y: touch.clientY }));

  const touched = (event: Touching): void => {
    event.stopPropagation();
    gestures.next({
      kind: 'touched',
      points: pointsOf(event.touches),
      time: event.timeStamp,
      size: { width: event.currentTarget.clientWidth, height: event.currentTarget.clientHeight }
    });
  };

  const moved = (event: TouchEvent): void => {
    event.stopPropagation();
    gestures.next({ kind: 'moved', points: pointsOf(event.touches) });
  };

  const released = (event: TouchEvent): void => {
    event.stopPropagation();
    gestures.next({ kind: 'released', points: pointsOf(event.touches) });
  };

  const keyed = (event: KeyboardEvent): void => {
    const step = STEPS.get(event.key);
    if (step !== undefined) {
      event.preventDefault();
      stepped(Math.min(photos.length - 1, Math.max(0, $shown + step)));
    }
  };

  const drawn =
    (current: PhotoGesture) =>
    (dialog: HTMLDialogElement): void => {
      dialog.style.setProperty('--zoom', `${current.scale}`);
      dialog.style.setProperty('--pan-x', `${current.pan.x}px`);
      dialog.style.setProperty('--pan-y', `${current.pan.y}px`);
      dialog.style.setProperty('--drop', `${current.drop}px`);
      dialog.style.setProperty('--fade', `${fadeOf(current)}`);
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

<dialog
  id="{uid}-viewer"
  class={['viewer', isZoomed($gesture) && 'zoomed', $gesture.hold.kind === 'dropping' && 'dropping']}
  aria-label={m.place_photos({ nom: name })}
  closedby="any"
  onbeforetoggle={toggled}
  onkeydown={keyed}
  ontouchstart={touched}
  ontouchmove={moved}
  ontouchend={released}
  ontouchcancel={released}
  {@attach opensAt(opening)}
  {@attach closedWhenAsked(closings, closed)}
  {@attach drawn($gesture)}
>
  <p class="count">{m.place_photos_count({ rang: $shown + 1, nombre: photos.length })}</p>
  <button type="button" class="round close" aria-label={m.place_photos_close()} commandfor="{uid}-viewer" command="close">
    <CloseIcon />
  </button>
  <ul class="track" onscroll={scrolled} {@attach movedBy(moves)}>
    {#each photos as photo, index (photo)}
      <li class={['slide', index === $shown && 'current']}>
        <img src={source(photo)} alt={m.place_photo({ rang: index + 1, nombre: photos.length, nom: name })} decoding="async" />
      </li>
    {/each}
  </ul>
  {#if $shown > 0}
    <button
      type="button"
      class="round arrow previous"
      aria-label={m.place_photos_previous()}
      onclick={(): void => stepped($shown - 1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  {/if}
  {#if $shown < photos.length - 1}
    <button type="button" class="round arrow next" aria-label={m.place_photos_next()} onclick={(): void => stepped($shown + 1)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  {/if}
  <p class="credit">{m.place_photos_credit()}</p>
</dialog>

<style>
  .viewer {
    --zoom: 1;
    --pan-x: 0;
    --pan-y: 0;
    --drop: 0;
    --fade: 1;
    box-sizing: border-box;
    inline-size: 100vw;
    max-inline-size: none;
    block-size: 100dvh;
    max-block-size: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    color: rgb(255 255 255);
    background: rgb(0 0 0);
    border: 0;
  }

  .viewer::backdrop {
    background: rgb(0 0 0);
  }

  .track {
    display: flex;
    block-size: 100%;
    padding: 0;
    margin: 0;
    overflow-x: auto;
    overscroll-behavior: contain;
    touch-action: pan-x;
    list-style: none;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .zoomed .track,
  .dropping .track {
    overflow-x: hidden;
    touch-action: none;
  }

  .slide {
    display: grid;
    flex: none;
    place-items: center;
    inline-size: 100%;
    block-size: 100%;
    overflow: hidden;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  img {
    max-inline-size: 100%;
    max-block-size: 100%;
    object-fit: contain;
    transition:
      translate 0.2s ease,
      scale 0.2s ease,
      opacity 0.2s ease;
  }

  .current img {
    opacity: var(--fade);
    scale: var(--zoom);
    translate: var(--pan-x) calc(var(--pan-y) + var(--drop));
  }

  .dropping .current img {
    transition: none;
  }

  .count {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 1;
    padding: 1.0625rem 1rem 2rem;
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    pointer-events: none;
    background: linear-gradient(rgb(0 0 0 / 0.55), transparent);
  }

  .round {
    position: absolute;
    z-index: 2;
    display: grid;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    padding: 0;
    color: rgb(255 255 255);
    cursor: pointer;
    background: rgb(255 255 255 / 0.16);
    border: 0;
    border-radius: 50%;
  }

  .round :global(svg) {
    inline-size: 1.375rem;
    block-size: 1.375rem;
    fill: none;
    stroke: currentcolor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .round:focus-visible {
    outline: 2px solid rgb(255 255 255);
    outline-offset: 2px;
  }

  .close {
    inset-block-start: 0.5rem;
    inset-inline-end: 0.75rem;
  }

  .arrow {
    inset-block-start: calc(50% - 1.375rem);
  }

  .previous {
    inset-inline-start: 0.75rem;
  }

  .next {
    inset-inline-end: 0.75rem;
  }

  .credit {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    padding: 2rem 1rem calc(1rem + env(safe-area-inset-bottom));
    margin: 0;
    font-size: 0.78125rem;
    color: rgb(255 255 255 / 0.85);
    pointer-events: none;
    background: linear-gradient(transparent, rgb(0 0 0 / 0.6));
  }

  @media (hover: hover) {
    .track {
      overflow-x: hidden;
    }
  }

  @media (hover: none) {
    .arrow {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
</style>
