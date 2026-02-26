
export interface AnalysisRequest {
  url: string;
  url2?: string;
  additionalInfo: string;
  mode: AnalysisMode;
}

export interface AnalysisResponse {
  report: string;
  timestamp: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AnalysisMode {
  PSYCHOLOGICAL = 'PSYCHOLOGICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  COMPARISON = 'COMPARISON'
}

export interface HistoryItem {
  id: string;
  url: string;
  url2?: string;
  mode: AnalysisMode;
  report: string;
  timestamp: number;
}
