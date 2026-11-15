import { describe, expect, it } from 'vitest';
import { toRules } from './rules';

describe('architecture rules', () => {
  it('keeps the name and the comment of a rule', () => {
    const rules = toRules([{ name: 'no-circular', comment: 'No cycles.', from: {}, to: { circular: true } }]);

    expect(rules).toEqual([{ name: 'no-circular', comment: 'No cycles.', from: [], to: ['circular: true'] }]);
  });

  it('describes every condition of the from and to sides', () => {
    const [rule] = toRules([
      {
        name: 'pure-domain',
        comment: 'Domains are pure.',
        from: { path: '^src/features/([^/]+)/domain/' },
        to: { pathNot: ['^src/features/$1/domain/', 'node_modules/rxjs/'] }
      }
    ]);

    expect(rule?.to).toEqual(['pathNot: ^src/features/$1/domain/, node_modules/rxjs/']);
  });

  it('describes no target for a rule without one', () => {
    const [rule] = toRules([{ name: 'no-dependents', from: { path: '^src/' } }]);

    expect(rule?.to).toEqual([]);
  });

  it('leaves a missing name empty', () => {
    const [rule] = toRules([{ comment: 'Unnamed.', from: {}, to: {} }]);

    expect(rule?.name).toBe('');
  });

  it('leaves a missing comment empty', () => {
    const [rule] = toRules([{ name: 'unnamed-reason', from: {}, to: {} }]);

    expect(rule?.comment).toBe('');
  });
});
