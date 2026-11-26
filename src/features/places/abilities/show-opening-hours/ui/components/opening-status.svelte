<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import { getLocale } from '#i18n/runtime';
  import '#libraries/design/tokens.css';
  import type { HoursView } from '../../domain/show-opening-hours';
  import { statusOf } from './opening-status.presenter';

  type Props = {
    readonly hours: Observable<HoursView>;
    readonly locale?: string;
  };

  const { hours, locale = getLocale() }: Props = $props();

  const status = $derived(statusOf($hours, locale));
</script>

{#if status !== undefined}
  <div>
    <dt>{m.place_sheet_hours()}</dt>
    <dd class={status.tone}>{status.head}</dd>
    {#if status.rest !== undefined}
      <dd class="rest">{status.rest}</dd>
    {/if}
  </div>
{/if}

<style>
  .open {
    color: var(--open);
  }

  .closed {
    color: var(--closed);
  }

  .neutral {
    color: var(--text);
  }
</style>
