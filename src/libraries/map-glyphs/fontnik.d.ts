declare module 'fontnik' {
  type RangeOptions = {
    readonly font: Buffer;
    readonly start: number;
    readonly end: number;
  };

  type RangeCallback = (error: Error | null, data: Buffer) => void;

  const fontnik: {
    readonly range: (options: RangeOptions, callback: RangeCallback) => void;
  };

  export = fontnik;
}
