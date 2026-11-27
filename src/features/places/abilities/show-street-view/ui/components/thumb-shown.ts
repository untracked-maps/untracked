const HIGHEST_SHARE = 0.6;

const thumbShown = (sheetHeight: number, viewportHeight: number): boolean => sheetHeight < HIGHEST_SHARE * viewportHeight;

export { thumbShown };
