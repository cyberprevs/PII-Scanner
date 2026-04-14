import Dashboard from './Dashboard';
import type { ScanResultResponse } from '../../types';

interface DashboardPageProps {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
  onNewScan: () => void;
}

export default function DashboardPage({ results, onDownloadReport: _onDownloadReport, onNewScan: _onNewScan }: DashboardPageProps) {
  return <Dashboard results={results} />;
}
