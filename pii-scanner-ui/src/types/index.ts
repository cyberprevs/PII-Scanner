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
  lastAccessedDate?: string;
  stalenessLevel?: string;
  staleDataWarning?: string;

  // Informations d'exposition
  exposureLevel?: string;
  accessibleToEveryone?: boolean;
  isNetworkShare?: boolean;
  userGroupCount?: number;
  exposureWarning?: string;
}

export interface ScanDetection {
  filePath: string;
  piiType: string;
  match: string;
  lastAccessedDate?: string;

  // Hash MD5 du fichier pour la détection de duplicatas
  fileHash?: string;

  // Informations d'exposition
  exposureLevel?: string;
  accessibleToEveryone?: boolean;
}

export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
