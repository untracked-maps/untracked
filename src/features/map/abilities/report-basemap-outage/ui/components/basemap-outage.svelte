<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';

  type Props = {
    readonly outage: Observable<boolean>;
  };

  const { outage }: Props = $props();
</script>

<div role="status">
  {#if $outage}
    <p>{m.basemap_outage()}</p>
  {/if}
</div>

<style>
  div {
    position: fixed;
    inset-block-end: 2.5rem;
    inset-inline: 0.5rem;
    z-index: 1;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  p {
    max-inline-size: 32rem;
    padding: 0.5rem 1rem;
    margin: 0;
    color: CanvasText;
    background: Canvas;
    border: 1px solid;
  }
</style>
