const FONT_STACKS = ['Inter Regular', 'Inter Medium', 'Inter SemiBold', 'Inter Bold', 'Inter Italic'] as const;

type FontStack = (typeof FONT_STACKS)[number];

const KNOWN_STACKS: ReadonlySet<string> = new Set(FONT_STACKS);

const isFontStack = (value: string): value is FontStack => KNOWN_STACKS.has(value);

export { FONT_STACKS, type FontStack, isFontStack };
