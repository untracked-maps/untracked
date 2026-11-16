<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
  import SegmentedControl from '#libraries/design/segmented-control.svelte';
  import { THEME_CHOICES, type ThemeChoice } from '../../domain/choose-theme';

  type Props = {
    readonly choice: Observable<ThemeChoice>;
    readonly onChoose: (choice: ThemeChoice) => void;
  };

  const { choice, onChoose }: Props = $props();

  const LABELS: Readonly<Record<ThemeChoice, () => string>> = {
    light: m.theme_light,
    dark: m.theme_dark,
    system: m.theme_system
  };

  const options = THEME_CHOICES.map((value) => ({ value, label: LABELS[value]() }));

  $effect(() => {
    document.documentElement.dataset['theme'] = $choice;
  });
</script>

<SegmentedControl legend={m.theme_label()} name="theme" {options} selected={$choice} onSelect={onChoose} />

<style>
  :global(:root) {
    color-scheme: light dark;
  }

  :global(:root[data-theme="light"]) {
    color-scheme: light;
  }

  :global(:root[data-theme="dark"]) {
    color-scheme: dark;
  }
</style>
