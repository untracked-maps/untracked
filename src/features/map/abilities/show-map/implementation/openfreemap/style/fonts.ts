type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'italic';

const fonts: Readonly<Record<FontWeight, string[]>> = {
  regular: ['Inter Regular'],
  medium: ['Inter Medium'],
  semibold: ['Inter SemiBold'],
  bold: ['Inter Bold'],
  italic: ['Inter Italic']
};

export { fonts };
