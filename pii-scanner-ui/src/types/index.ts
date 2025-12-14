export interface ScanRequest {
  directoryPath: string;
  piiTypes?: string[];
}

export interface ScanResponse {
  scanId: string;
  status: string;
  message?: string;
}

export interface ScanProgressResponse {
  scanId: string;
  status: string;
  processedFiles: number;
  totalFiles: number;
  piiFound: number;
}

export interface ScanResultResponse {
  scanId: string;
  statistics: ScanStatistics;
  detections: ScanDetection[];
}

export interface ScanStatistics {
  totalFilesScanned: number;
  filesWithPii: number;
  totalPiiFound: number;
  piiByType: Record<string, number>;
  topRiskyFiles: RiskyFile[];
}

export interface RiskyFile {
  filePath: string;
  piiCount: number;
  riskLevel: string;
}

export interface ScanDetection {
  filePath: string;
  piiType: string;
  match: string;
}

export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
