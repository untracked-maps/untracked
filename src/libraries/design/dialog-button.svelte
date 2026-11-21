<script lang="ts">
  import { Subject } from 'rxjs';
  import type { Snippet } from 'svelte';
  import { type Closable, closedWhenAsked, NEVER_ASKED, toggleTold } from './closable';
  import CloseButton from './close-button.svelte';
  import { backdropShare, type SwipeEvent, swipeClosed, swipeOf, swipeOffset } from './dialog-swipe';
  import IconButton from './icon-button.svelte';
  import './tokens.css';

  type Props = {
    readonly label: string;
    readonly title: string;
    readonly description?: string;
    readonly closeLabel: string;
    readonly icon: Snippet;
    readonly children: Snippet;
    readonly closable?: Closable;
  };

  const { label, title, description, closeLabel, icon, children, closable = NEVER_ASKED }: Props = $props();

  const uid = $props.id();

  const closed = (dialog: HTMLDialogElement): void => dialog.close();

  const PHONE = '(width <= 699px) and (orientation: portrait), (width <= 559px)';

  const FIELDS = 'input, select, textarea';

  const CLOSING_DELAY = 180;

  type Touching = TouchEvent & { readonly currentTarget: HTMLDialogElement };

  const events = new Subject<SwipeEvent>();

  const swipe = swipeOf(events);

  const closingDelay = (): number => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSING_DELAY);

  const inField = (target: EventTarget | null): boolean => target instanceof Element && target.closest(FIELDS) !== null;

  const toggled = (event: ToggleEvent): void => {
    toggleTold(closable)(event);
    events.next({ kind: 'toggled' });
  };

  const touched = (event: Touching): void => {
    const [touch] = event.touches;
    if (touch !== undefined) {
      events.next({
        kind: 'touched',
        x: touch.clientX,
        y: touch.clientY,
        time: event.timeStamp,
        allowed: matchMedia(PHONE).matches && event.currentTarget.scrollTop === 0 && !inField(event.target)
      });
    }
  };

  const moved = (event: TouchEvent): void => {
    const [touch] = event.touches;
    if (touch !== undefined) {
      events.next({ kind: 'moved', x: touch.clientX, y: touch.clientY });
    }
  };

  const released = (event: TouchEvent): void => events.next({ kind: 'released', time: event.timeStamp });
</script>

<IconButton {label} opens="{uid}-dialog" tone="neutral">{@render icon()}</IconButton>

<dialog
  id="{uid}-dialog"
  aria-labelledby="{uid}-title"
  aria-describedby={description === undefined ? undefined : `${uid}-description`}
  class={[$swipe.follows === true && 'swiping', $swipe.closing && 'closing']}
  style:--swipe-offset="{swipeOffset($swipe)}px"
  style:--backdrop-share={backdropShare($swipe)}
  closedby="any"
  onbeforetoggle={toggled}
  ontouchstart={touched}
  ontouchmove={moved}
  ontouchend={released}
  ontouchcancel={released}
  {@attach closedWhenAsked(closable.closings, closed)}
  {@attach closedWhenAsked(swipeClosed(swipe, closingDelay), closed)}
>
  <div class="handle" data-dialog-handle aria-hidden="true"></div>
  <div class="heading">
    <hgroup>
      <h2 id="{uid}-title">{title}</h2>
      {#if description !== undefined}
        <p id="{uid}-description">{description}</p>
      {/if}
    </hgroup>
  </div>
  <div class="close">
    <CloseButton label={closeLabel} closes="{uid}-dialog" />
  </div>
  <div class="content">
    {@render children()}
  </div>
</dialog>

<style>
  dialog {
    --swipe-offset: 0;
    --backdrop-share: 1;
    box-sizing: border-box;
    inline-size: min(26.25rem, 100% - 2 * var(--edge));
    max-inline-size: 26.25rem;
    max-block-size: calc(100dvh - 2rem);
    padding: 1.25rem 1.25rem 1.375rem;
    color: var(--text);
    pointer-events: auto;
    background: var(--surface);
    border: 0;
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-float);

    translate: 0 var(--swipe-offset);
    transition: translate 0.2s ease;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / calc(40% * var(--backdrop-share)));
  }

  .swiping {
    transition: none;
  }

  .closing {
    translate: 0 100%;
  }

  .handle {
    display: none;
  }

  .heading {
    padding-inline-end: calc(2rem + var(--space-2));
    margin-block-end: var(--space-4);
  }

  .close {
    position: absolute;
    inset-block-start: 0.75rem;
    inset-inline-end: 0.75rem;
  }

  .close :global(button)::after {
    position: absolute;
    inset: -0.375rem;
    content: "";
  }

  .close :global(button) {
    position: relative;
  }

  h2 {
    margin: 0;
    font-size: 1.1875rem;
  }

  hgroup p {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  .content {
    display: grid;
    gap: var(--space-4);
  }

  @media (width <= 699px) and (orientation: portrait), (width <= 559px) {
    dialog {
      inline-size: 100%;
      max-inline-size: 100%;
      max-block-size: 92dvh;
      padding-block-end: max(1.375rem, env(safe-area-inset-bottom));
      margin-block-end: 0;
      border-radius: 1.375rem 1.375rem 0 0;
    }

    .handle {
      position: absolute;
      inset-block-start: var(--space-2);
      inset-inline-start: calc(50% - 1.1875rem);
      display: block;
      inline-size: 2.375rem;
      block-size: 0.3125rem;
      background: var(--grip);
      border-radius: var(--radius-full);
    }
  }
</style>
