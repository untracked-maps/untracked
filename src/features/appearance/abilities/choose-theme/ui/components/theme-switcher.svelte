<script lang="ts">
  import type { Observable } from 'rxjs';
  import { m } from '#i18n/messages';
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

  $effect(() => {
    document.documentElement.dataset['theme'] = $choice;
  });
</script>

<fieldset>
  <legend>{m.theme_label()}</legend>
  {#each THEME_CHOICES as option (option)}
    <label>
      <input type="radio" name="theme" value={option} checked={$choice === option} onchange={(): void => onChoose(option)} />
      {LABELS[option]()}
    </label>
  {/each}
</fieldset>

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

  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    align-items: center;
    padding: 0;
    margin: 0;
    border: 0;
  }

  legend {
    float: inline-start;
    padding: 0;
  }

  label {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
    min-block-size: 24px;
  }
</style>
