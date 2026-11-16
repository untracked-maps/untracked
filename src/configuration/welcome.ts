const WELCOME_STORAGE_KEY = 'untracked-maps.welcome.acknowledged';

const WELCOME_BEFORE_FIRST_PAINT: string = `if (localStorage.getItem('${WELCOME_STORAGE_KEY}') === 'true') document.documentElement.dataset.welcomed = '';`;

export { WELCOME_BEFORE_FIRST_PAINT, WELCOME_STORAGE_KEY };
