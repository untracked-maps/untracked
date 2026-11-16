<script lang="ts" generics="T extends string">
  import './tokens.css';

  type Props = {
    readonly legend: string;
    readonly name: string;
    readonly options: readonly { readonly value: T; readonly label: string }[];
    readonly selected: T | undefined;
    readonly onSelect: (value: T) => void;
  };

  const { legend, name, options, selected, onSelect }: Props = $props();
</script>

<fieldset>
  <legend>{legend}</legend>
  <div class="segments">
    {#each options as option (option.value)}
      <label>
        <input
          type="radio"
          {name}
          value={option.value}
          checked={option.value === selected}
          onchange={(): void => onSelect(option.value)}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    align-items: center;
    justify-content: space-between;
    min-inline-size: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }

  legend {
    float: inline-start;
    padding: 0;
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
  }

  .segments {
    display: flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--line);
    border-radius: var(--radius-full);
  }

  label {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: var(--segment-height);
    padding: 0 var(--space-3);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    border-radius: var(--radius-full);
  }

  label:has(:checked) {
    color: var(--text-on-accent);
    background: var(--accent-strong);
  }

  label:has(:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  input {
    position: absolute;
    inset: 0;
    margin: 0;
    cursor: pointer;
    opacity: 0;
  }

  @media (forced-colors: active) {
    label:has(:checked) {
      color: SelectedItemText;
      forced-color-adjust: none;
      background: SelectedItem;
    }
  }
</style>
