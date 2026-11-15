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

const colours: Readonly<Record<Colour, string>> = {
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

export { colours };
