<script lang="ts">
  import { m } from '#i18n/messages';
  import { localizeHref } from '#i18n/runtime';
</script>

<h1>{m.not_found_title()}</h1>
<p><a href={localizeHref('/')}>{m.not_found_home_link()}</a></p>
