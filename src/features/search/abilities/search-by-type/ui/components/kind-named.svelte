<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import Suggestion from '#libraries/design/suggestion.svelte';
  import type { CategoryKey } from '../../domain/categories';
  import CategoryDot from './category-dot.svelte';
  import { nameOf } from './category-names';

  type Props = {
    readonly named: Observable<CategoryKey | undefined>;
    readonly onChoose: (category: CategoryKey) => void;
    readonly onClear: () => void;
  };

  const { named, onChoose, onClear }: Props = $props();

  const choose = (category: CategoryKey) => (): void => {
    onClear();
    onChoose(category);
  };
</script>

{#if $named !== undefined}
  <button type="button" onclick={choose($named)}>
    <Suggestion name={m.search_by_type_near_you({ types: nameOf($named) })} details={m.search_by_type_near_centre()}>
      {#snippet icon()}
        <CategoryDot category={$named} />
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
