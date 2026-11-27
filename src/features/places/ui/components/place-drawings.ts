import DRAWINGS from './place-dot-drawings.json' with { type: 'json' };

type PlaceDrawing = {
  readonly colour: string;
  readonly pictogram: string;
};

type DrawnFamily = keyof typeof DRAWINGS;

const drawingOf = (family: DrawnFamily): PlaceDrawing => DRAWINGS[family];

export { drawingOf };
