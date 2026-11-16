<script lang="ts" generics="T extends string">
  import type { Snippet } from 'svelte';
  import FieldGroup from './field-group.svelte';
  import './tokens.css';

  type Props = {
    readonly legend: string;
    readonly name: string;
    readonly choices: readonly { readonly value: T; readonly label: string }[];
    readonly chosen: T | undefined;
    readonly onChoose: (value: T) => void;
    readonly picture: Snippet<[T]>;
  };

  const { legend, name, choices, chosen, onChoose, picture }: Props = $props();
</script>

<FieldGroup {legend}>
  <div class="choices">
    {#each choices as { value, label } (value)}
      <label>
        <span class="picture">{@render picture(value)}</span>
        <input type="radio" {name} {value} checked={value === chosen} onchange={(): void => onChoose(value)} />
        <span>{label}</span>
      </label>
    {/each}
  </div>
</FieldGroup>

<style>
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  label {
    position: relative;
    display: grid;
    gap: var(--space-1);
    justify-items: center;
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    cursor: pointer;
  }

  label > input {
    position: absolute;
    inset: 0;
    z-index: 1;
    margin: 0;
    cursor: inherit;
    opacity: 0;
  }

  .picture {
    display: block;
    inline-size: 100%;
    block-size: 4.375rem;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: var(--radius-s);
  }

  label:has(:checked) {
    color: var(--accent);
  }

  label:has(:checked) .picture {
    border-color: var(--accent);
  }

  label:has(:focus-visible) .picture {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  @media (forced-colors: active) {
    label:has(:checked) .picture {
      border-color: Highlight;
    }
  }
</style>
