type Size = {
  readonly width: number;
  readonly height: number;
};

type Padding = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

const WIDE_SCREEN = 700;

const EDGE = 48;

const BESIDE_THE_BUTTONS = 88;

const BESIDE_THE_PANEL = 488;

const UNDER_THE_PANEL = 0.6;

const BESIDE_THE_PANEL_PADDING: Padding = { top: EDGE, right: BESIDE_THE_BUTTONS, bottom: EDGE, left: BESIDE_THE_PANEL };

const underThePanelPadding = (height: number): Padding => ({
  top: Math.round(height * UNDER_THE_PANEL),
  right: EDGE,
  bottom: EDGE,
  left: EDGE
});

const fitPaddingFor = ({ width, height }: Size): Padding =>
  width >= WIDE_SCREEN ? BESIDE_THE_PANEL_PADDING : underThePanelPadding(height);

export { fitPaddingFor };
