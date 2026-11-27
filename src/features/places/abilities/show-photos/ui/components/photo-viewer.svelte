<script lang="ts">
  import { distinctUntilChanged, filter, map, merge, type Observable, Subject, shareReplay, startWith } from 'rxjs';
  import { m } from '#i18n/messages';
  import { type Closable, closedWhenAsked, followed, NEVER_ASKED, toggleTold } from '#libraries/design/closable';
  import CloseIcon from '#libraries/design/close-icon.svelte';
  import '#libraries/design/tokens.css';
  import { touchPoints } from '../../../../ui/components/swipe-down';
  import '../../../../ui/components/viewer-frame.css';
  import type { Photos } from '../../domain/show-photos';
  import { fadeOf, type GestureEvent, isZoomed, type PhotoGesture, photoGesture } from './photo-gesture';

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

  const stepped = (index: number): void => moves.next({ index, scrolling: 'auto' });

  const opensAt = (openings: Observable<number>): ((dialog: HTMLDialogElement) => () => void) =>
    followed(openings, (dialog: HTMLDialogElement, index: number) => {
      dialog.showModal();
      moves.next({ index, scrolling: 'instant' });
    });

  const movedBy = (wanted: Observable<Move>): ((track: HTMLElement) => () => void) =>
    followed(wanted, (track: HTMLElement, { index, scrolling }: Move) =>
      track.scrollTo({ left: index * track.clientWidth, behavior: scrolling })
    );

  const closed = (dialog: HTMLDialogElement): void => dialog.close();

  const toggled = (event: ToggleEvent): void => {
    toggleTold(closable)(event);
    gestures.next({ kind: 'reset' });
  };

  const scrolled = (event: Scrolling): void => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    scrolls.next(Math.round(scrollLeft / clientWidth));
  };

  const touched = (event: Touching): void => {
    gestures.next({
      kind: 'touched',
      points: touchPoints(event.touches),
      time: event.timeStamp,
      size: { width: event.currentTarget.clientWidth, height: event.currentTarget.clientHeight }
    });
  };

  const moved = (event: TouchEvent): void => gestures.next({ kind: 'moved', points: touchPoints(event.touches) });

  const released = (event: TouchEvent): void => gestures.next({ kind: 'released', points: touchPoints(event.touches) });

  const keyed = (event: KeyboardEvent): void => {
    const step = STEPS.get(event.key);
    if (step !== undefined) {
      event.preventDefault();
      stepped($shown + step);
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
  class={['viewer', 'viewer-frame', isZoomed($gesture) && 'zoomed', $gesture.hold.kind === 'dropping' && 'dropping']}
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
  <p class="viewer-top">{m.place_photos_count({ rang: $shown + 1, nombre: photos.length })}</p>
  <button
    type="button"
    class="viewer-round viewer-close"
    aria-label={m.place_photos_close()}
    commandfor="{uid}-viewer"
    command="close"
  >
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
      class="viewer-round arrow previous"
      aria-label={m.place_photos_previous()}
      onclick={(): void => stepped($shown - 1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  {/if}
  {#if $shown < photos.length - 1}
    <button
      type="button"
      class="viewer-round arrow next"
      aria-label={m.place_photos_next()}
      onclick={(): void => stepped($shown + 1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  {/if}
  <p class="viewer-credit">{m.place_photos_credit()}</p>
</dialog>

<style>
  .viewer {
    --zoom: 1;
    --pan-x: 0;
    --pan-y: 0;
  }

  .track {
    display: flex;
    block-size: 100%;
    padding: 0;
    margin: 0;
    overflow-x: auto;
    scroll-behavior: smooth;
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

  .arrow {
    inset-block-start: calc(50% - 1.375rem);
  }

  .previous {
    inset-inline-start: 0.75rem;
  }

  .next {
    inset-inline-end: 0.75rem;
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
    .track {
      scroll-behavior: auto;
    }

    img {
      transition: none;
    }
  }
</style>
