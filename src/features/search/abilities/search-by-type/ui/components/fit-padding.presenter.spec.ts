import { describe, expect, it } from 'vitest';
import { fitPaddingFor } from './fit-padding.presenter';

describe('padding of the places fitted on the map', () => {
  it('leaves the panel on the left of a wide screen', () => {
    expect(fitPaddingFor({ width: 700, height: 800 })).toEqual({ top: 48, right: 88, bottom: 48, left: 488 });
  });

  it('leaves the panel at the top of a phone', () => {
    expect(fitPaddingFor({ width: 699, height: 801 })).toEqual({ top: 481, right: 48, bottom: 48, left: 48 });
  });
});
