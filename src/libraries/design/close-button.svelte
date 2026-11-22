<script lang="ts">
  import CloseIcon from './close-icon.svelte';
  import RoundButton from './round-button.svelte';

  type Action =
    | { readonly onclick: () => void; readonly closes?: never }
    | { readonly closes: string; readonly onclick?: never };

  type Props = Action & {
    readonly label: string;
  };

  const { label, onclick, closes }: Props = $props();
</script>

<RoundButton {label} commandfor={closes} command={closes === undefined ? undefined : 'close'} {onclick}>
  <CloseIcon />
</RoundButton>
