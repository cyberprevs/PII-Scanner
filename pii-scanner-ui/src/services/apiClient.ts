import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import type {
  ScanRequest,
  ScanResponse,
  ScanProgressResponse,
  ScanResultResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';
const SIGNALR_URL = 'http://localhost:5000/scanhub';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ScanApiClient {
  private hubConnection: signalR.HubConnection | null = null;

  async startScan(request: ScanRequest): Promise<ScanResponse> {
    const response = await apiClient.post<ScanResponse>('/scan/start', request);
    return response.data;
  }

  async getProgress(scanId: string): Promise<ScanProgressResponse> {
    const response = await apiClient.get<ScanProgressResponse>(`/scan/${scanId}/progress`);
    return response.data;
  }

  async getResults(scanId: string): Promise<ScanResultResponse> {
    const response = await apiClient.get<ScanResultResponse>(`/scan/${scanId}/results`);
    return response.data;
  }

  async downloadReport(scanId: string, format: 'csv' | 'json' | 'html' | 'excel'): Promise<Blob> {
    const response = await apiClient.get(`/scan/${scanId}/report/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async cleanupScan(scanId: string): Promise<void> {
    await apiClient.delete(`/scan/${scanId}`);
  }

  async connectSignalR(
    onProgress: (scanId: string, current: number, total: number) => void,
    onComplete: (scanId: string) => void,
    onError: (scanId: string, error: string) => void
  ): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveProgress', onProgress);
    this.hubConnection.on('ScanComplete', onComplete);
    this.hubConnection.on('ScanError', onError);

    try {
      await this.hubConnection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection error:', err);
      throw err;
    }
  }

  async disconnectSignalR(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  // ===== Data Retention API =====
  async scanForOldFiles(directoryPath: string, retentionPolicies?: Record<string, number>): Promise<RetentionScanResponse> {
    const response = await apiClient.post<RetentionScanResponse>('/dataretention/scan', {
      directoryPath,
      retentionPolicies: retentionPolicies || {
        banking: 5,
        identity: 3,
        health: 5,
        education: 2,
        contact: 1
      }
    });
    return response.data;
  }

  async deleteOldFiles(filePaths: string[]): Promise<DeleteFilesResponse> {
    const response = await apiClient.post<DeleteFilesResponse>('/dataretention/delete', {
      filePaths
    });
    return response.data;
  }
}

export const scanApi = new ScanApiClient();

// ===== Types for Data Retention =====
export interface RetentionScanResponse {
  success: boolean;
  filesFound: number;
  totalPii: number;
  files: OldFileInfo[];
}

export interface OldFileInfo {
  path: string;
  age: number;
  lastModified: string;
  piiCount: number;
  reason: string;
  sizeBytes: number;
}

export interface DeleteFilesResponse {
  success: boolean;
  deletedCount: number;
  failedCount: number;
  deletedFiles: string[];
  failedFiles: string[];
}
