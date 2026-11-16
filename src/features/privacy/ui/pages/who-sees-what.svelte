<script lang="ts">
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
</script>

<h1>{m.privacy_title()}</h1>
<p>{m.privacy_intro()}</p>

{#snippet service(id: string, name: string, href: string, facts: readonly (readonly [string, string])[])}
  <section aria-labelledby={id}>
    <h2 {id}><a {href} rel="external">{name}</a></h2>
    <dl>
      {#each facts as [term, detail] (term)}
        <dt>{term}</dt>
        <dd>{detail}</dd>
      {/each}
    </dl>
  </section>
{/snippet}

{@render service('openfreemap', 'OpenFreeMap', 'https://openfreemap.org', [
  [m.privacy_sees(), m.privacy_ip_and_area()],
  [m.privacy_why(), m.privacy_openfreemap_why()]
])}

{@render service('ign', 'IGN Géoplateforme', 'https://geoservices.ign.fr', [
  [m.privacy_sees(), m.privacy_ip_and_area()],
  [m.privacy_why(), m.privacy_ign_why()],
  [m.privacy_when(), m.privacy_ign_when()],
  [m.privacy_logs(), m.privacy_ign_logs()]
])}

{@render service('idfm', 'Île-de-France Mobilités', 'https://data.iledefrance-mobilites.fr', [
  [m.privacy_sees(), m.privacy_idfm_sees()],
  [m.privacy_why(), m.privacy_idfm_why()],
  [m.privacy_when(), m.privacy_idfm_when()],
  [m.privacy_logs(), m.privacy_idfm_logs()]
])}

<style>
  section {
    padding-block-start: var(--space-4);
    margin-block-start: var(--space-4);
    border-block-start: 1px solid var(--line);
  }

  dl {
    display: grid;
    gap: var(--space-1);
    margin: 0;
  }

  dt {
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-strong);
    color: var(--text-muted);
  }

  dd {
    margin: 0 0 var(--space-2);
  }
</style>
