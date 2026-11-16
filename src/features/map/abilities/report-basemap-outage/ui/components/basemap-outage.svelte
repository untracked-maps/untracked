<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/tokens.css';

  type Props = {
    readonly outage: Observable<boolean>;
  };

  const { outage }: Props = $props();
</script>

<div role="status">
  {#if $outage}
    <Floating tone="inverse">
      <p>{m.basemap_outage()}</p>
    </Floating>
  {/if}
</div>

<style>
  div {
    display: flex;
    justify-content: center;
  }

  div > :global(*) {
    max-inline-size: 26rem;
  }

  p {
    margin: 0;
    font-weight: var(--font-weight-strong);
  }
</style>
