<script lang="ts">
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
  import ContentPage from '#libraries/design/content-page.svelte';
  import { page } from '$app/state';
  import type { LayoutProps } from './$types';

  const { children, data }: LayoutProps = $props();
</script>

<LanguageSuggestion
  suggestion={data.languageSuggestion.suggestion}
  path={page.url.pathname}
  onDismiss={data.languageSuggestion.dismiss}
/>

<ContentPage> {@render children()} </ContentPage>
