<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import PictureChoice from '#libraries/design/picture-choice.svelte';
  import { BASEMAPS, type Basemap } from '../../domain/choose-basemap';

  type Props = {
    readonly basemap: Observable<Basemap>;
    readonly onChoose: (basemap: Basemap) => void;
  };

  const { basemap, onChoose }: Props = $props();

  const LABELS: Readonly<Record<Basemap, () => string>> = {
    plan: m.basemap_plan,
    satellite: m.basemap_satellite
  };

  const choices = BASEMAPS.map((value) => ({ value, label: LABELS[value]() }));
</script>

<PictureChoice legend={m.layers_label()} name="basemap" {choices} chosen={$basemap} {onChoose}>
  {#snippet picture(value: Basemap)}
    <span class={['thumbnail', value]}></span>
  {/snippet}
</PictureChoice>

<style>
  .thumbnail {
    display: block;
    block-size: 100%;
  }

  .plan {
    background:
      linear-gradient(115deg, transparent 45%, light-dark(rgb(255 255 255), rgb(74 79 87)) 45% 52%, transparent 52%),
      linear-gradient(25deg, transparent 60%, light-dark(rgb(255 255 255), rgb(74 79 87)) 60% 66%, transparent 66%),
      radial-gradient(circle at 25% 70%, light-dark(rgb(212 235 203), rgb(47 74 53)) 0 18%, transparent 19%),
      light-dark(rgb(241 238 232), rgb(35 38 43));
  }

  .satellite {
    background:
      radial-gradient(circle at 30% 35%, rgb(79 107 58) 0 14%, transparent 15%),
      radial-gradient(circle at 72% 70%, rgb(91 116 69) 0 12%, transparent 13%),
      linear-gradient(115deg, transparent 44%, rgb(154 154 148) 44% 50%, transparent 50%),
      linear-gradient(25deg, rgb(125 116 106) 0 30%, rgb(163 150 134) 30% 62%, rgb(111 106 98) 62%);
  }
</style>
