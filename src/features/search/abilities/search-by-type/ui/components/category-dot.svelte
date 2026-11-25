<script lang="ts">
  import type { CategoryKey } from '../../domain/categories';
  import './category-colours.css';

  type Props = {
    readonly category: CategoryKey;
  };

  const { category }: Props = $props();
</script>

<span class="dot" data-category={category} aria-hidden="true"></span>

<style>
  .dot {
    display: block;
    flex-shrink: 0;
    inline-size: 0.625rem;
    block-size: 0.625rem;
    background: var(--category-colour);
    border-radius: 50%;
  }
</style>
