<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
  import type { HoursView } from '../../domain/show-opening-hours';
  import { dayOf, hoursOf } from './opening-hours.presenter';

  type Props = {
    readonly hours: Observable<HoursView>;
  };

  const { hours }: Props = $props();

  const uid = $props.id();
</script>

{#if $hours.status === 'known' || $hours.status === 'unknown'}
  <section aria-labelledby="{uid}-hours">
    <h3 id="{uid}-hours">{m.place_sheet_hours()}</h3>
    {#if $hours.status === 'known'}
      <table>
        <tbody>
          {#each $hours.week as { weekday, today, hours: day } (weekday)}
            <tr class={{ today }} aria-current={today ? 'date' : undefined}>
              <th scope="row">{dayOf(weekday)}</th>
              <td>{hoursOf(day)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>{m.place_sheet_hours_not_known_yet()}</p>
    {/if}
  </section>
{/if}

<style>
  section {
    margin-block-start: 1.375rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text);
  }

  table {
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--text);
    border-collapse: collapse;
  }

  th {
    padding: 0.25rem 1.25rem 0.25rem 0;
    font-weight: 400;
    color: var(--text-muted);
    text-align: start;
    text-transform: capitalize;
  }

  td {
    padding: 0.25rem 0;
  }

  .today th,
  .today td {
    font-weight: 600;
    color: var(--text);
  }

  p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text);
  }
</style>
