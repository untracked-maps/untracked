<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type Closable, closedWhenAsked, NEVER_ASKED, toggleTold } from './closable';
  import Floating from './floating.svelte';
  import IconButton from './icon-button.svelte';
  import { menuPlace } from './menu-place';
  import './tokens.css';

  type Props = {
    readonly label: string;
    readonly icon: Snippet;
    readonly children: Snippet;
    readonly closable?: Closable;
  };

  const { label, icon, children, closable = NEVER_ASKED }: Props = $props();

  const uid = $props.id();

  const closed = (dialog: HTMLDialogElement): void => dialog.hidePopover();

  const UNPLACED = { left: 0, top: 0, right: 0, bottom: 0 };

  const buttonBox = (): DOMRect | typeof UNPLACED =>
    document.querySelector(`[popovertarget="${uid}-panel"]:not([popovertargetaction])`)?.getBoundingClientRect() ?? UNPLACED;

  const place = (panel: HTMLElement): void => {
    const button = buttonBox();
    const { top, left, maxHeight } = menuPlace({
      button,
      menu: { width: panel.offsetWidth, height: panel.scrollHeight },
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
    });
    panel.style.setProperty('inset-block-start', `${top}px`);
    panel.style.setProperty('inset-inline-start', `${left}px`);
    panel.style.setProperty('max-block-size', `${maxHeight}px`);
  };

  const cover = (over: HTMLElement): void => {
    const { left, top, right, bottom } = buttonBox();
    over.style.setProperty('inset-block-start', `${top}px`);
    over.style.setProperty('inset-inline-start', `${left}px`);
    over.style.setProperty('inline-size', `${right - left}px`);
    over.style.setProperty('block-size', `${bottom - top}px`);
  };

  const covered = (over: HTMLElement): (() => void) => {
    const observer = new ResizeObserver(() => cover(over));
    observer.observe(over);
    observer.observe(document.documentElement);
    return observer.disconnect.bind(observer);
  };

  const placed = (panel: HTMLElement): (() => void) => {
    const observer = new ResizeObserver(() => place(panel));
    observer.observe(panel);
    observer.observe(document.documentElement);
    return observer.disconnect.bind(observer);
  };
</script>

<IconButton {label} toggles="{uid}-panel" tone="neutral">{@render icon()}</IconButton>

<dialog
  id="{uid}-panel"
  popover="auto"
  aria-label={label}
  onbeforetoggle={toggleTold(closable)}
  {@attach closedWhenAsked(closable.closings, closed)}
>
  <button
    type="button"
    class="scrim"
    tabindex="-1"
    aria-hidden="true"
    popovertarget="{uid}-panel"
    popovertargetaction="hide"
  ></button>
  <button
    type="button"
    class="over-button"
    tabindex="-1"
    aria-hidden="true"
    popovertarget="{uid}-panel"
    popovertargetaction="hide"
    {@attach covered}
  ></button>
  <div class="panel" data-menu-panel {@attach placed}>
    <Floating>
      <div class="sections">
        {@render children()}
      </div>
    </Floating>
  </div>
</dialog>

<style>
  :global(button):has(+ dialog .over-button:active) {
    background: var(--surface-open-pressed);
  }

  :global(button):has(+ dialog):active {
    background: var(--surface-pressed);
  }

  :global(button):has(+ dialog:popover-open) {
    color: var(--accent);
    background: var(--surface-open);
  }

  dialog {
    inset: 0;
    inline-size: 100%;
    max-inline-size: none;
    block-size: 100%;
    max-block-size: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    pointer-events: auto;
    background: none;
    border: 0;
  }

  .scrim {
    position: absolute;
    inset: 0;
    padding: 0;
    cursor: default;
    background: none;
    border: 0;
  }

  .over-button {
    position: absolute;
    padding: 0;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: 50%;
  }

  .panel {
    position: absolute;
    box-sizing: border-box;
    inline-size: min(20rem, 100% - 1rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-float);
  }

  .sections {
    display: grid;
    gap: var(--space-4);
  }

  .sections > :global(* + *) {
    padding-block-start: var(--space-4);
    border-block-start: 1px solid var(--line);
  }
</style>
