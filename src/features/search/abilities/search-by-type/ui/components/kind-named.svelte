<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import Suggestion from '#libraries/design/suggestion.svelte';
  import type { PlaceKind } from '../../../../domain/place';
  import KindDot from './kind-dot.svelte';
  import { pluralOf } from './kind-plurals';

  type Props = {
    readonly named: Observable<PlaceKind | undefined>;
    readonly onChoose: (kind: PlaceKind) => void;
    readonly onClear: () => void;
  };

  const { named, onChoose, onClear }: Props = $props();

  const choose = (kind: PlaceKind) => (): void => {
    onClear();
    onChoose(kind);
  };
</script>

{#if $named !== undefined}
  <button type="button" onclick={choose($named)}>
    <Suggestion name={m.search_by_type_near_you({ types: pluralOf($named) })} details={m.search_by_type_near_centre()}>
      {#snippet icon()}
        <KindDot kind={$named} />
      {/snippet}
    </Suggestion>
  </button>
{/if}

<style>
  button {
    display: block;
    inline-size: 100%;
    padding: 0;
    cursor: pointer;
    background: none;
    border: 0;
  }

  button:focus-visible {
    outline-offset: -3px;
  }
</style>
