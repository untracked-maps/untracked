type ForbiddenRule = {
  readonly name?: string | undefined;
  readonly comment?: string | undefined;
  readonly from: object;
  readonly to?: object | undefined;
};

type Rule = {
  readonly name: string;
  readonly comment: string;
  readonly from: readonly string[];
  readonly to: readonly string[];
};

const formatValue = (value: unknown): string => (Array.isArray(value) ? value.join(', ') : String(value));

const describeConditions = (conditions: object): readonly string[] =>
  Object.entries(conditions).map(([key, value]) => `${key}: ${formatValue(value)}`);

const toRules = (forbidden: readonly ForbiddenRule[]): readonly Rule[] =>
  forbidden.map(({ name, comment, from, to }) => ({
    name: name ?? '',
    comment: comment ?? '',
    from: describeConditions(from),
    to: describeConditions(to ?? {})
  }));

export { type Rule, toRules };
