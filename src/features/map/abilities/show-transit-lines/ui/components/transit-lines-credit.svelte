<script lang="ts">
  import type { Observable } from 'rxjs';

  type Props = {
    readonly shown: Observable<boolean>;
  };

  const { shown }: Props = $props();
</script>

{#if $shown}
  · <a href="https://data.iledefrance-mobilites.fr" rel="external">© Île-de-France Mobilités</a>
{/if}
