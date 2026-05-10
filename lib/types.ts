export type WarType = 'war' | 'revolution' | 'colonial';
export type RegionId = 0 | 1 | 2 | 3; // 欧州/アジア/中東・アフリカ/南北米
export type EraId = 'early-modern' | '20th-century' | 'contemporary';

export interface War {
  id: string;
  year: number;
  endYear: number;
  name: string;
  region: RegionId;
  type: WarType;
  era: EraId;
  theater: string;
  mapHighlight: string;
  markers: MapMarker[];
}

export interface MapMarker {
  cx: number;
  cy: number;
  label: string;
  isMain?: boolean;
  ally?: boolean;
  enemy?: boolean;
}

export interface TabContent {
  digest: DigestData;
  detail: DetailData;
  perspectives: PerspectiveData[];
  structure: StructureData;
  legacy: LegacyData[];
}

export interface DigestData {
  background: string;
  actors: string;
  structural: string;
  aftermath: string;
}

export interface DetailData {
  title: string;
  kicker: string;
  lead: string;
  sections: { heading: string; body: string }[];
}

export interface PerspectiveData {
  flag: string;
  nation: string;
  text: string;
  wide?: boolean;
}

export interface StructureData {
  summary: string;
  factors: { title: string; body: string }[];
}

export interface LegacyData {
  label: string;
  color: string;
  text: string;
}
