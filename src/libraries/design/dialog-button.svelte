<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type Closable, closedWhenAsked, NEVER_ASKED, toggleTold } from './closable';
  import CloseButton from './close-button.svelte';
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
</script>

<IconButton {label} opens="{uid}-dialog" tone="neutral">{@render icon()}</IconButton>

<dialog
  id="{uid}-dialog"
  aria-labelledby="{uid}-title"
  aria-describedby={description === undefined ? undefined : `${uid}-description`}
  closedby="any"
  onbeforetoggle={toggleTold(closable)}
  {@attach closedWhenAsked(closable.closings, closed)}
>
  <div class="heading">
    <hgroup>
      <h2 id="{uid}-title">{title}</h2>
      {#if description !== undefined}
        <p id="{uid}-description">{description}</p>
      {/if}
    </hgroup>
    <CloseButton label={closeLabel} closes="{uid}-dialog" />
  </div>
  <div class="content">
    {@render children()}
  </div>
</dialog>

<style>
  dialog {
    box-sizing: border-box;
    inline-size: min(26rem, 100% - 2 * var(--edge));
    max-block-size: calc(100dvh - 2 * var(--edge));
    padding: var(--space-5);
    color: var(--text);
    pointer-events: auto;
    background: var(--surface);
    border: 0;
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-float);
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 40%);
  }

  .heading {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    justify-content: space-between;
    margin-block-end: var(--space-4);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-lead);
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

  @media (width < 700px) {
    dialog {
      inline-size: 100%;
      max-inline-size: 100%;
      padding-block-end: max(var(--space-5), env(safe-area-inset-bottom));
      margin-block-end: 0;
      border-end-start-radius: 0;
      border-end-end-radius: 0;
    }
  }
</style>
