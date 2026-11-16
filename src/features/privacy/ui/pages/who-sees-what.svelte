<script lang="ts">
  import { m } from '#i18n/messages';
  import '#libraries/design/tokens.css';
</script>

<h1>{m.privacy_title()}</h1>
<p>{m.privacy_intro()}</p>

<section aria-labelledby="openfreemap">
  <h2 id="openfreemap"><a href="https://openfreemap.org" rel="external">OpenFreeMap</a></h2>
  <dl>
    <dt>{m.privacy_sees()}</dt>
    <dd>{m.privacy_openfreemap_sees()}</dd>
    <dt>{m.privacy_why()}</dt>
    <dd>{m.privacy_openfreemap_why()}</dd>
  </dl>
</section>

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
