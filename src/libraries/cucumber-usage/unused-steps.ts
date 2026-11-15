type StepUsage = {
  readonly pattern: string;
  readonly matches: readonly unknown[];
  readonly uri: string;
  readonly line: number;
};

const isUnused = ({ matches }: StepUsage): boolean => matches.length === 0;

const describeStep = ({ pattern, uri, line }: StepUsage): string => `${uri}:${line} ${pattern}`;

const unusedSteps = (usage: readonly StepUsage[]): readonly string[] => usage.filter(isUnused).map(describeStep);

export { type StepUsage, unusedSteps };
