<script lang="ts">
  import { type Observable, Subject } from 'rxjs';
  import { m } from '#i18n/messages';
  import { type Closable, NEVER_ASKED } from '#libraries/design/closable';
  import '#libraries/design/tokens.css';
  import type { Photos } from '../../domain/show-photos';
  import { photoLoaded } from './photo-loaded';
  import PhotoViewer from './photo-viewer.svelte';

  type Props = {
    readonly photos: Observable<Photos>;
    readonly name: string;
    readonly source: (path: string) => string;
    readonly closable?: Closable;
  };

  const { photos, name, source, closable = NEVER_ASKED }: Props = $props();

  const opening = new Subject<number>();
</script>

{#if $photos.length > 0}
  <ul class={['strip', $photos.length === 1 && 'one']} aria-label={m.place_photos({ nom: name })} data-sheet-sideways>
    {#each $photos as photo, index (photo)}
      <li>
        <button
          type="button"
          class="card"
          aria-label={m.place_photo({ rang: index + 1, nombre: $photos.length, nom: name })}
          aria-haspopup="dialog"
          onclick={(): void => opening.next(index)}
        >
          <img src={source(photo)} alt="" loading="lazy" decoding="async" {@attach photoLoaded} />
        </button>
      </li>
    {/each}
  </ul>
  <PhotoViewer photos={$photos} {name} {source} {opening} {closable} />
{/if}

<style>
  .strip {
    display: flex;
    gap: 0.5rem;
    padding: 0 var(--space-4);
    margin: 0.875rem calc(-1 * var(--space-4)) 0;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    list-style: none;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--space-4);
    scrollbar-width: none;
  }

  li {
    flex: none;
    inline-size: calc((100% - 0.5rem) / 2.15);
    scroll-snap-align: start;
  }

  .one li {
    inline-size: 100%;
  }

  .card {
    display: block;
    inline-size: 100%;
    aspect-ratio: 4 / 4.4;
    padding: 0;
    overflow: hidden;
    cursor: zoom-in;
    background: var(--surface-sunken);
    border: 0;
    border-radius: 1.125rem;
  }

  .one .card {
    aspect-ratio: 16 / 10;
  }

  .card:not(:has(img[data-loaded])) {
    animation: breathe 1.2s ease-in-out infinite alternate;
  }

  img {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  img:global([data-loaded]) {
    opacity: 1;
  }

  @keyframes breathe {
    to {
      opacity: 0.55;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card:not(:has(img[data-loaded])) {
      animation: none;
    }

    img {
      transition: none;
    }
  }
</style>
