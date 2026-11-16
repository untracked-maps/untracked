<script lang="ts">
  import CloseIcon from './close-icon.svelte';
  import './tokens.css';

  type Action =
    | { readonly onclick: () => void; readonly closes?: never }
    | { readonly closes: string; readonly onclick?: never };

  type Props = Action & {
    readonly label: string;
  };

  const { label, onclick, closes }: Props = $props();
</script>

<button type="button" aria-label={label} commandfor={closes} command={closes === undefined ? undefined : 'close'} {onclick}>
  <CloseIcon />
</button>

<style>
  button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    padding: 0;
    color: var(--text-muted);
    cursor: pointer;
    background: var(--surface-sunken);
    border: 0;
    border-radius: 50%;
  }
</style>
