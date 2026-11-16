<script lang="ts">
  import './tokens.css';

  type Props = {
    readonly label: string;
    readonly hint?: string;
    readonly checked: boolean | undefined;
    readonly onToggle: (checked: boolean) => void;
  };

  const { label, hint, checked, onToggle }: Props = $props();

  const uid = $props.id();
</script>

<div class="checkbox">
  <input
    id="{uid}-box"
    type="checkbox"
    {checked}
    aria-describedby={hint === undefined ? undefined : `${uid}-hint`}
    onchange={(event): void => onToggle(event.currentTarget.checked)}
  />
  <label for="{uid}-box">{label}</label>
  {#if hint !== undefined}
    <small id="{uid}-hint">{hint}</small>
  {/if}
</div>

<style>
  .checkbox {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--space-3);
    align-items: center;
  }

  input {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    margin: 0;
    accent-color: var(--accent-strong);
    cursor: pointer;
  }

  label {
    min-block-size: 1.5rem;
    padding-block: var(--space-1);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    cursor: pointer;
  }

  small {
    grid-column: 2;
    font-size: var(--font-size-small);
    color: var(--text-muted);
  }
</style>
