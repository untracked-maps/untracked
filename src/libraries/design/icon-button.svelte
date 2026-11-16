<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Action =
    | { readonly onclick: () => void; readonly opens?: never; readonly toggles?: never }
    | { readonly opens: string; readonly onclick?: never; readonly toggles?: never }
    | { readonly toggles: string; readonly onclick?: never; readonly opens?: never };

  type Props = Action & {
    readonly children: Snippet;
    readonly label: string;
    readonly tone?: 'accent' | 'neutral';
    readonly disabled?: boolean;
  };

  const { children, label, onclick, opens, toggles, tone = 'accent', disabled = false }: Props = $props();
</script>

<button
  type="button"
  class={tone}
  aria-label={label}
  aria-haspopup={opens === undefined ? undefined : 'dialog'}
  commandfor={opens}
  command={opens === undefined ? undefined : 'show-modal'}
  popovertarget={toggles}
  {disabled}
  {onclick}
>
  {@render children()}
</button>

<style>
  button {
    position: relative;
    display: grid;
    flex-shrink: 0;
    place-items: center;
    inline-size: var(--control-size);
    block-size: var(--control-size);
    padding: 0;
    pointer-events: auto;
    cursor: pointer;
    background: var(--surface);
    border: 0;
    border-radius: 50%;
    box-shadow: var(--shadow-float);
  }

  button:disabled {
    cursor: progress;
  }

  .accent {
    color: var(--accent);
  }

  .neutral {
    color: var(--text);
  }
</style>
