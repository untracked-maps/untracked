import { describe, expect, it } from 'vitest';
import { type StepUsage, unusedSteps } from './unused-steps';

const step = (pattern: string, matches: readonly object[]): StepUsage => ({
  pattern,
  matches,
  uri: 'src/features/x/abilities/y/y.steps.ts',
  line: 3
});

describe('unused steps', () => {
  it('lists a step definition that no scenario uses, with its location', () => {
    expect(unusedSteps([step('a forgotten step', [])])).toEqual(['src/features/x/abilities/y/y.steps.ts:3 a forgotten step']);
  });

  it('leaves out a step definition that a scenario uses', () => {
    expect(unusedSteps([step('a used step', [{}])])).toEqual([]);
  });
});
