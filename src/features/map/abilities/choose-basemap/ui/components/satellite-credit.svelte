<script lang="ts">
  import type { Observable } from 'rxjs';
  import type { Basemap } from '../../domain/choose-basemap';

  type Props = {
    readonly basemap: Observable<Basemap>;
  };

  const { basemap }: Props = $props();
</script>

{#if $basemap === 'satellite'}
  · <a href="https://geoservices.ign.fr/bdortho" rel="external">© IGN BD ORTHO®</a>
{/if}
