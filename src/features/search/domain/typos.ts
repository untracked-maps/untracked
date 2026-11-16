const MOST_TYPOS_COUNTED = 3;

const startsSwapped = (typed: string, term: string): boolean => term.startsWith(`${typed.charAt(1)}${typed.charAt(0)}`);

const typosWithin = (typed: string, term: string, budget: number): number => {
  if (typed === '' || term === '') {
    return Math.max(typed.length, term.length);
  }
  if (term.startsWith(typed.charAt(0))) {
    return typosWithin(typed.slice(1), term.slice(1), budget);
  }
  if (budget === 0) {
    return 1;
  }
  const rest = budget - 1;
  return (
    1 +
    Math.min(
      typosWithin(typed.slice(1), term, rest),
      typosWithin(typed, term.slice(1), rest),
      typosWithin(typed.slice(1), term.slice(1), rest),
      startsSwapped(typed, term) ? typosWithin(typed.slice(2), term.slice(2), rest) : Number.POSITIVE_INFINITY
    )
  );
};

const typosBetween = (typed: string, term: string): number => typosWithin(typed, term, MOST_TYPOS_COUNTED);

export { typosBetween };
