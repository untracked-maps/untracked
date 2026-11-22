<script lang="ts">
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
  import { longPress } from '#libraries/design/long-press';
  import type { SheetPlace } from '../../domain/open-place';
  import { callLink, facebookPageOf, instagramAccountOf, linkOf, siteNameOf } from './place-contact.presenter';

  type Props = {
    readonly place: SheetPlace;
    readonly address: string | undefined;
    readonly onCopy: (text: string) => void;
    readonly vibrate: (milliseconds: number) => void;
  };

  const { place, address, onCopy, vibrate }: Props = $props();

  const uid = $props.id();

  const pages = $derived(
    [
      { label: m.place_sheet_website(), link: place.website, text: siteNameOf },
      { label: m.place_sheet_menu(), link: place.menu, text: (): string => m.place_sheet_see_menu() },
      { label: m.place_sheet_instagram(), link: place.instagram, text: instagramAccountOf },
      { label: m.place_sheet_facebook(), link: place.facebook, text: facebookPageOf }
    ].flatMap(({ link, ...line }) => (link === undefined ? [] : [{ ...line, link }]))
  );
</script>

{#if place.phone !== undefined || pages.length > 0 || address !== undefined}
  <section aria-labelledby="{uid}-details">
    <h3 id="{uid}-details">{m.place_sheet_details()}</h3>
    <dl>
      {#if place.phone !== undefined}
        <div>
          <dt>{m.place_sheet_phone()}</dt>
          <dd><a href={callLink(place.phone)}>{place.phone}</a></dd>
        </div>
      {/if}
      {#each pages as { label, link, text } (label)}
        <div>
          <dt>{label}</dt>
          <dd><a href={linkOf(link)} target="_blank" rel="noopener">{text(link)}</a></dd>
        </div>
      {/each}
      {#if address !== undefined}
        <div>
          <dt>{m.place_sheet_address()}</dt>
          <dd class="address" {@attach longPress({ onPress: (): void => onCopy(address), vibrate })}>{address}</dd>
        </div>
      {/if}
    </dl>
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

  dl {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    margin: 0;
    background: var(--surface-sunken);
    border-radius: var(--radius-m);
  }

  dt {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  dd {
    margin: 0;
    font-size: 0.96875rem;
    color: var(--text);
    overflow-wrap: anywhere;
  }

  a {
    display: inline-flex;
    align-items: center;
    min-block-size: 1.5rem;
    color: var(--accent);
    text-decoration: none;
  }

  .address {
    user-select: none;
    -webkit-touch-callout: none;
  }
</style>
