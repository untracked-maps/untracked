import { describe, expect, it } from 'vitest';
import { toFolders } from './folders';

describe('allowed folders', () => {
  it('prefixes every allowed pattern with the root and drops the trailing wildcard', () => {
    const folders = toFolders({ root: 'src', rules: ['routes/**', 'features/*/domain/**'] });

    expect(folders).toEqual(['src/routes', 'src/features/*/domain']);
  });
});

describe('allowed folders with a wildcard inside', () => {
  it('keeps a wildcard that is not trailing', () => {
    const folders = toFolders({ root: 'src', rules: ['libraries/**/internal/**'] });

    expect(folders).toEqual(['src/libraries/**/internal']);
  });
});

describe('allowed folders without a root', () => {
  it('keeps the patterns as they are', () => {
    const folders = toFolders({ rules: ['src/routes/**', 'messages'] });

    expect(folders).toEqual(['src/routes', 'messages']);
  });
});
