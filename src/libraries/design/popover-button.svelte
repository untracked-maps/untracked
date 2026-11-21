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

  const UNPLACED = new DOMRect();

  const place = (panel: HTMLElement): void => {
    const button = document.querySelector(`[popovertarget="${uid}-panel"]`)?.getBoundingClientRect() ?? UNPLACED;
    const { top, left, maxHeight } = menuPlace({
      button,
      menu: { width: panel.offsetWidth, height: panel.scrollHeight },
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
    });
    panel.style.setProperty('inset-block-start', `${top}px`);
    panel.style.setProperty('inset-inline-start', `${left}px`);
    panel.style.setProperty('max-block-size', `${maxHeight}px`);
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
  <div class="panel" data-menu-panel {@attach placed}>
    <Floating>
      <div class="sections">
        {@render children()}
      </div>
    </Floating>
  </div>
</dialog>

<style>
  dialog {
    inset: 0;
    inline-size: 100%;
    max-inline-size: none;
    block-size: 100%;
    max-block-size: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
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
