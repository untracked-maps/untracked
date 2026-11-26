type Tags = Readonly<Partial<Record<string, string>>>;

type Checked = {
  readonly year: number;
  readonly month: number;
};

type Freshness = { readonly state: 'verified' | 'not verified'; readonly checked: Checked };

const MEAN_MONTH = 2.63e9;

const FRESH_MONTHS = 24;

const CHECK_DATE = /^(?<year>\d{4})-(?<month>0[1-9]|1[0-2])(?:-(?<day>0[1-9]|[12]\d|3[01]))?$/u;

const checkDateOf = (tags: Tags): string | undefined => tags['check_date'] ?? tags['check_date:opening_hours'];

const checkedAt = (value: string): { readonly checked: Checked; readonly time: number } | undefined => {
  const groups = CHECK_DATE.exec(value)?.groups;
  if (groups === undefined) {
    return undefined;
  }
  const year = Number(groups['year']);
  const month = Number(groups['month']);
  return { checked: { year, month }, time: Date.UTC(year, month - 1, Number(groups['day'] ?? 1)) };
};

const freshnessOf = (tags: Tags, now: number): Freshness | undefined => {
  const value = checkDateOf(tags);
  const read = value === undefined ? undefined : checkedAt(value);
  if (read === undefined) {
    return undefined;
  }
  return { state: (now - read.time) / MEAN_MONTH <= FRESH_MONTHS ? 'verified' : 'not verified', checked: read.checked };
};

export { type Freshness, freshnessOf, type Tags };
