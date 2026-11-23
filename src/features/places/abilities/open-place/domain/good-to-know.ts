type Tags = Readonly<Partial<Record<string, string>>>;

type Fact =
  | 'historic-monument'
  | 'contactless'
  | 'cards-accepted'
  | 'cards-refused'
  | 'cash-refused'
  | 'meal-vouchers'
  | 'terrace'
  | 'vegan-only'
  | 'vegetarian-only'
  | 'vegan-options'
  | 'vegetarian-options'
  | 'gluten-free'
  | 'takeaway-only'
  | 'takeaway'
  | 'delivery'
  | 'reservation-required'
  | 'reservation-recommended'
  | 'reservation-possible'
  | 'no-reservation'
  | 'free-wifi'
  | 'wifi'
  | 'air-conditioned'
  | 'accessible-toilets'
  | 'toilets'
  | 'changing-table'
  | 'dogs-welcome'
  | 'dogs-on-a-leash'
  | 'dogs-not-allowed'
  | 'self-service'
  | 'second-hand'
  | 'organic-only'
  | 'organic-products';

type Sign = 'yes' | 'no';

type GoodToKnow = {
  readonly fact: Fact;
  readonly sign: Sign;
};

type Condition = (tags: Tags) => boolean;

type Choice = {
  readonly fact: Fact;
  readonly when: Condition;
};

const YES: readonly string[] = ['yes', 'only', 'designated'];

const WARNINGS: ReadonlySet<Fact> = new Set<Fact>([
  'cards-refused',
  'cash-refused',
  'reservation-required',
  'dogs-not-allowed'
]);

const is =
  (key: string, ...values: readonly string[]): Condition =>
  (tags: Tags): boolean =>
    values.some((value) => tags[key] === value);

const isYes = (key: string): Condition => is(key, ...YES);

const has =
  (key: string): Condition =>
  (tags: Tags): boolean =>
    tags[key] !== undefined;

const any =
  (...conditions: readonly Condition[]): Condition =>
  (tags: Tags): boolean =>
    conditions.some((condition) => condition(tags));

const both =
  (first: Condition, second: Condition): Condition =>
  (tags: Tags): boolean =>
    first(tags) && second(tags);

const WIFI = is('internet_access', 'wlan', 'yes', 'wifi');

const GROUPS: readonly (readonly Choice[])[] = [
  [{ fact: 'historic-monument', when: any(has('heritage'), is('heritage:operator', 'mhs'), has('ref:mhs')) }],
  [{ fact: 'contactless', when: isYes('payment:contactless') }],
  [
    {
      fact: 'cards-accepted',
      when: any(isYes('payment:credit_cards'), isYes('payment:cards'), isYes('payment:debit_cards'))
    },
    { fact: 'cards-refused', when: any(is('payment:credit_cards', 'no'), is('payment:cards', 'no')) }
  ],
  [{ fact: 'cash-refused', when: is('payment:cash', 'no') }],
  [{ fact: 'meal-vouchers', when: any(is('payment:meal_voucher', 'yes'), is('payment:cheque_dejeuner', 'yes')) }],
  [{ fact: 'terrace', when: is('outdoor_seating', 'yes') }],
  [
    { fact: 'vegan-only', when: is('diet:vegan', 'only') },
    { fact: 'vegetarian-only', when: is('diet:vegetarian', 'only') },
    { fact: 'vegan-options', when: isYes('diet:vegan') },
    { fact: 'vegetarian-options', when: isYes('diet:vegetarian') }
  ],
  [{ fact: 'gluten-free', when: isYes('diet:gluten_free') }],
  [
    { fact: 'takeaway-only', when: is('takeaway', 'only') },
    { fact: 'takeaway', when: isYes('takeaway') }
  ],
  [{ fact: 'delivery', when: is('delivery', 'yes') }],
  [
    { fact: 'reservation-required', when: is('reservation', 'required') },
    { fact: 'reservation-recommended', when: is('reservation', 'recommended') },
    { fact: 'reservation-possible', when: is('reservation', 'yes') },
    { fact: 'no-reservation', when: is('reservation', 'no') }
  ],
  [
    { fact: 'free-wifi', when: both(WIFI, is('internet_access:fee', 'no')) },
    { fact: 'wifi', when: WIFI }
  ],
  [{ fact: 'air-conditioned', when: is('air_conditioning', 'yes') }],
  [
    { fact: 'accessible-toilets', when: both(is('toilets', 'yes'), is('toilets:wheelchair', 'yes')) },
    { fact: 'toilets', when: is('toilets', 'yes') }
  ],
  [{ fact: 'changing-table', when: is('changing_table', 'yes') }],
  [
    { fact: 'dogs-welcome', when: is('dog', 'yes') },
    { fact: 'dogs-on-a-leash', when: is('dog', 'leashed') },
    { fact: 'dogs-not-allowed', when: is('dog', 'no') }
  ],
  [{ fact: 'self-service', when: is('self_service', 'yes') }],
  [{ fact: 'second-hand', when: is('second_hand', 'only') }],
  [
    { fact: 'organic-only', when: is('organic', 'only') },
    { fact: 'organic-products', when: is('organic', 'yes') }
  ]
];

const signed = ({ fact }: Choice): GoodToKnow => ({ fact, sign: WARNINGS.has(fact) ? 'no' : 'yes' });

const goodToKnowOf = (tags: Tags = {}): readonly GoodToKnow[] =>
  GROUPS.flatMap((group) => group.find(({ when }) => when(tags)) ?? []).map(signed);

export { type Fact, goodToKnowOf, type Tags };
