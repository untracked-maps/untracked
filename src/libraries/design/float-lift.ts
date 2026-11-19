type FloatMeasures = {
  readonly sheetHeight: number;
  readonly stackHeight: number;
  readonly viewportHeight: number;
  readonly topBarBottom: number;
  readonly inset: number;
};

type FloatLift = {
  readonly offset: number;
  readonly hidden: boolean;
};

const GAP = 8;

const AT_REST: FloatLift = { offset: 0, hidden: false };

const floatLift = ({ sheetHeight, stackHeight, viewportHeight, topBarBottom, inset }: FloatMeasures): FloatLift =>
  sheetHeight > 0
    ? {
        offset: Math.max(0, sheetHeight + GAP - inset),
        hidden: stackHeight + GAP > viewportHeight - sheetHeight - topBarBottom
      }
    : AT_REST;

export { type FloatMeasures, floatLift };
