<script lang="ts">
  import RoundButton from './round-button.svelte';
  import ShareIcon from './share-icon.svelte';

  type Props = {
    readonly label: string;
    readonly onclick: () => void;
  };

  const { label, onclick }: Props = $props();
</script>

<RoundButton {label} {onclick}>
  <ShareIcon />
</RoundButton>
