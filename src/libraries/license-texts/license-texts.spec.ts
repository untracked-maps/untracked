import { describe, expect, it } from 'vitest';
import { LICENSE_FILES, licenseText } from './license-texts';

describe('license texts', () => {
  it('lists the text of the LGPL 3.0', () => {
    expect(LICENSE_FILES).toEqual(['LGPL-3.0-only.txt']);
  });

  it('reads the text of the LGPL 3.0 from the library that is under it', async () => {
    expect(await licenseText('LGPL-3.0-only.txt')).toContain('GNU LESSER GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007');
  });

  it('comes with the text of the GPL 3.0 that the LGPL 3.0 supplements', async () => {
    expect(await licenseText('LGPL-3.0-only.txt')).toContain('\n\nGNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007');
  });

  it('has no text for a file it does not list', async () => {
    expect(await licenseText('MIT.txt')).toBeUndefined();
  });
});
