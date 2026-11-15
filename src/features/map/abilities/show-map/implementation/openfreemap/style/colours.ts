type Colour =
  | 'border'
  | 'building'
  | 'buildingEdge'
  | 'cityBorder'
  | 'halo'
  | 'highway'
  | 'highwayCase'
  | 'houseNumber'
  | 'label'
  | 'labelSoft'
  | 'land'
  | 'landAlt'
  | 'landFar'
  | 'majorCase'
  | 'majorRoadLabel'
  | 'park'
  | 'path'
  | 'pedestrian'
  | 'placeHalo'
  | 'rail'
  | 'road'
  | 'roadCase'
  | 'roadLabel'
  | 'water'
  | 'wood';

type Palette = Readonly<Record<Colour, string>>;

const lightPalette: Palette = {
  border: '#A58BB8',
  building: '#EFE8D3',
  buildingEdge: '#E6DEC6',
  cityBorder: '#C9C3BA',
  halo: '#FFFFFF',
  highway: '#FAD98A',
  highwayCase: '#EDC060',
  houseNumber: '#A2A6AB',
  label: '#2E3135',
  labelSoft: '#7C8187',
  land: '#F4EFDF',
  landAlt: '#EFEADA',
  landFar: '#F7F3E6',
  majorCase: '#CDD2D2',
  majorRoadLabel: '#8C9096',
  park: '#D4EBCB',
  path: '#D3CEC6',
  pedestrian: '#EAEAEA',
  placeHalo: 'rgba(255,255,255,0.8)',
  rail: '#CCC8C1',
  road: '#CBD1D1',
  roadCase: '#CCD1D1',
  roadLabel: '#6A6E73',
  water: '#ABD4F2',
  wood: '#C7E3BC'
};

const darkPalette: Palette = {
  border: '#9C88C9',
  building: '#2A2E34',
  buildingEdge: '#33373E',
  cityBorder: '#4A4E55',
  halo: 'rgba(22,24,28,0.9)',
  highway: '#465A78',
  highwayCase: '#33435A',
  houseNumber: '#6F757C',
  label: '#E6E8EB',
  labelSoft: '#8A9097',
  land: '#1E2126',
  landAlt: '#22262B',
  landFar: '#2C343A',
  majorCase: '#31353C',
  majorRoadLabel: '#9AA0A6',
  park: '#1F2D26',
  path: '#4A4F57',
  pedestrian: '#262A30',
  placeHalo: 'rgba(22,24,28,0.9)',
  rail: '#474B52',
  road: '#3A3F47',
  roadCase: '#2B2F35',
  roadLabel: '#A3A8AE',
  water: '#14304C',
  wood: '#1D2A23'
};

const basemapPalettes: Readonly<Record<'light' | 'dark', Palette>> = { light: lightPalette, dark: darkPalette };

export { basemapPalettes, type Colour, type Palette };
