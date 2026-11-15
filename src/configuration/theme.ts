const THEME_STORAGE_KEY = 'untracked-maps.theme';

const THEME_BEFORE_FIRST_PAINT: string = `document.documentElement.dataset.theme = localStorage.getItem('${THEME_STORAGE_KEY}') ?? 'system';`;

export { THEME_BEFORE_FIRST_PAINT, THEME_STORAGE_KEY };
