<script lang="ts">
  import type { Snippet } from 'svelte';
  import './tokens.css';

  type Props = {
    readonly icon: Snippet;
    readonly name: string;
    readonly details: string;
    readonly active?: boolean;
  };

  const { icon, name, details, active = false }: Props = $props();

  const classes = $derived(active ? 'suggestion active' : 'suggestion');
</script>

<span class={classes}>
  <span class="badge">{@render icon()}</span>
  <span class="text">
    <span class="name">{name}</span>
    <span class="details">{details}</span>
  </span>
</span>

<style>
  .suggestion {
    display: grid;
    grid-template-columns: var(--control-size) minmax(0, 1fr);
    align-items: center;
    padding-block: var(--space-2);
    padding-inline-end: var(--space-4);
    color: var(--text);
    text-align: start;
    cursor: pointer;
  }

  .suggestion:hover,
  .suggestion.active {
    background: var(--surface-sunken);
  }

  .badge {
    display: grid;
    place-items: center;
    justify-self: center;
    inline-size: 2rem;
    block-size: 2rem;
    color: var(--text-muted);
    background: var(--surface-sunken);
    border-radius: 50%;
  }

  .suggestion:hover .badge,
  .suggestion.active .badge {
    background: var(--surface);
  }

  .text {
    display: grid;
    gap: 1px;
  }

  .name {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-strong);
    line-height: var(--line-height-tight);
    overflow-wrap: anywhere;
  }

  .details {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-meta);
    color: var(--text-muted);
    white-space: nowrap;
  }
</style>
