<script lang="ts">
  import type { Snippet } from 'svelte';
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';

  type Props = {
    readonly privacyHref: string;
    readonly licenseTextsHref: string;
    readonly deliveredSourceHref: string;
    readonly languages: Snippet;
  };

  const { privacyHref, licenseTextsHref, deliveredSourceHref, languages }: Props = $props();
</script>

<section>
  <h3>{m.about_privacy()}</h3>
  <ul>
    <li class="item">
      <span>{m.about_no_account()}</span>
      <small>{m.about_nothing_kept()}</small>
    </li>
    <li>
      <a class="item" href={privacyHref}>
        <span>{m.privacy_title()}</span>
        <small>{m.about_check()}</small>
      </a>
    </li>
  </ul>
</section>

<section>
  <h3>{m.about_sources()}</h3>
  <ul>
    <li>
      <a class="item" href="https://www.openstreetmap.org" rel="external">
        <span>OpenStreetMap</span>
        <small>{m.about_openstreetmap()}</small>
      </a>
    </li>
    <li>
      <a class="item" href="https://openfreemap.org" rel="external">
        <span>OpenFreeMap</span>
        <small>{m.about_openfreemap()}</small>
      </a>
    </li>
    <li>
      <a class="item" href="https://geoservices.ign.fr" rel="external">
        <span>IGN Géoplateforme</span>
        <small>{m.about_ign()}</small>
      </a>
    </li>
    <li>
      <a class="item" href="https://data.iledefrance-mobilites.fr" rel="external">
        <span>Île-de-France Mobilités</span>
        <small>{m.about_idfm()}</small>
      </a>
    </li>
    <li class="item">
      <span>{m.about_opening_hours_license()}</span>
      <small class="links">
        <a href={licenseTextsHref} data-sveltekit-reload>{m.about_license_texts()}</a>
        ·
        <a href={deliveredSourceHref} rel="external">{m.about_delivered_source()}</a>
      </small>
    </li>
  </ul>
</section>

<section>
  <h3>{m.about_help()}</h3>
  <ul>
    <li>
      <a class="item" href="https://www.openstreetmap.org/fixthemap" rel="external"><span>{m.about_report()}</span></a>
    </li>
    <li>
      <a class="item" href="https://github.com/untracked-maps/untracked" rel="external"><span>{m.about_source_code()}</span></a>
    </li>
  </ul>
</section>

{@render languages()}

<p class="credits">
  <a href="https://www.openstreetmap.org/copyright" rel="external">{m.about_credits_openstreetmap()}</a>
  {m.about_credits_rest()}
</p>

<style>
  h3 {
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-strong);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  ul {
    padding: 0;
    margin: 0;
    overflow: hidden;
    list-style: none;
    background: var(--surface-sunken);
    border-radius: var(--radius-m);
  }

  li + li {
    border-block-start: 1px solid var(--line);
  }

  .item {
    display: grid;
    gap: 2px;
    align-content: center;
    min-block-size: 3rem;
    padding: var(--space-2) var(--space-4);
    color: var(--text);
    text-decoration: none;
  }

  a.item span {
    font-weight: var(--font-weight-strong);
    color: var(--accent);
  }

  small {
    font-size: var(--font-size-meta);
    color: var(--text-muted);
  }

  .links a {
    color: var(--accent);
  }

  .credits {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--text-muted);
  }

  .credits a {
    color: inherit;
  }
</style>
