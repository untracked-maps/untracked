import { describe, expect, it } from 'vitest';
import { fonts } from './fonts';

describe('fonts', () => {
  it('uses the five Inter styles served with the app', () => {
    expect(Object.values(fonts)).toStrictEqual([
      ['Inter Regular'],
      ['Inter Medium'],
      ['Inter SemiBold'],
      ['Inter Bold'],
      ['Inter Italic']
    ]);
  });
});
