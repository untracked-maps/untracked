type Part = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

const partOf = (parts: readonly Intl.DateTimeFormatPart[], type: Part): number =>
  Number(parts.find((part) => part.type === type)?.value);

const wallClockOf = (time: number, timeZone: string | undefined): Date => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).formatToParts(time);
  return new Date(
    partOf(parts, 'year'),
    partOf(parts, 'month') - 1,
    partOf(parts, 'day'),
    partOf(parts, 'hour'),
    partOf(parts, 'minute'),
    partOf(parts, 'second')
  );
};

export { wallClockOf };
