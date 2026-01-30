
export enum NicheLevel {
  BAJO = 'Bajo',
  MEDIO = 'Medio',
  ALTO = 'Alto'
}

export interface NicheAnalysis {
  score: number;
  level: NicheLevel;
  headline: string;
  diagnosis: string;
  recommendations: string[];
  risks: string[];
  sources?: { title: string; uri: string }[];
}

export interface UserInput {
  niche: string;
  salesStatus: string;
  ticketPrice: string;
  acquisitionChannel: string;
}

export interface LeadData extends UserInput {
  analysis: NicheAnalysis;
  email: string;
  subscribe: boolean;
  createdAt: string;
}