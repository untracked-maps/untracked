import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

type LicenseText = { readonly library: string; readonly path: string };

const LICENSE_TEXTS: Readonly<Record<string, LicenseText>> = {
  'LGPL-3.0-only.txt': { library: 'opening_hours', path: 'LICENSES/LGPL-3.0-only.txt' }
};

const { resolve } = createRequire(import.meta.url);

const LICENSE_FILES: readonly string[] = Object.keys(LICENSE_TEXTS);

const pathOf = ({ library, path }: LicenseText): string => join(dirname(resolve(`${library}/package.json`)), path);

const licenseText = (file: string): Promise<string | undefined> => {
  const text = LICENSE_TEXTS[file];
  return text === undefined ? Promise.resolve(undefined) : readFile(pathOf(text), 'utf8');
};

export { LICENSE_FILES, licenseText };
