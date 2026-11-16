<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';

  type Props = {
    readonly shown: Observable<boolean>;
  };

  const { shown }: Props = $props();
</script>

{#if $shown}
  · <a href="https://geoservices.ign.fr/services-geoplateforme-diffusion" rel="external">{m.map_credit_bike_lanes()}</a>
{/if}
