<script lang="ts">
  import { NEVER, type Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import BottomSheet from '#libraries/design/bottom-sheet.svelte';
  import { closedWhenAsked } from '#libraries/design/closable';
  import CloseButton from '#libraries/design/close-button.svelte';
  import Floating from '#libraries/design/floating.svelte';
  import '#libraries/design/sheet-card.css';
  import '#libraries/design/tokens.css';
  import type { DistrictSheet } from '../../domain/open-district';

  type Props = {
    readonly sheet: Observable<DistrictSheet>;
    readonly onClose: () => void;
    readonly onSheetHeight?: (height: number) => void;
    readonly closings?: Observable<unknown>;
  };

  const { sheet, onClose, onSheetHeight, closings = NEVER }: Props = $props();

  const uid = $props.id();

  const district = $derived($sheet.status === 'open' ? $sheet.district : undefined);
</script>

<div class="district" aria-live="polite">
  {#if district !== undefined}
    <BottomSheet
      subject={`${district.postalCode} ${district.name}`}
      growLabel={m.sheet_grow()}
      reduceLabel={m.sheet_reduce()}
      {onClose}
      onHeight={onSheetHeight}
    >
      <section class="sheet-card" aria-labelledby="{uid}-name" {@attach closedWhenAsked(closings, onClose)}>
        <Floating>
          <div class="sheet-card-heading">
            <hgroup>
              <h2 id="{uid}-name">{district.name}</h2>
              <p>{district.addressLocality}</p>
            </hgroup>
            <CloseButton label={m.open_district_close()} onclick={onClose} />
          </div>
        </Floating>
      </section>
    </BottomSheet>
  {/if}
</div>

<style>
  .district {
    position: absolute;
  }

  .district:empty {
    display: none;
  }
</style>
