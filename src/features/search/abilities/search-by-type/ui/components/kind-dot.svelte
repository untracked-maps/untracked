<script lang="ts">
  import type { PlaceKind } from '../../../../domain/place';
  import './kind-colours.css';

  type Props = {
    readonly kind: PlaceKind;
  };

  const { kind }: Props = $props();
</script>

<span class="dot" data-kind={kind} aria-hidden="true"></span>

<style>
  .dot {
    display: block;
    flex-shrink: 0;
    inline-size: 0.625rem;
    block-size: 0.625rem;
    background: var(--kind-colour);
    border-radius: 50%;
  }
</style>
