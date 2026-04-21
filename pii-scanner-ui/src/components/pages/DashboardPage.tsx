import Dashboard from './Dashboard';
import type { ScanResultResponse } from '../../types';

interface DashboardPageProps {
  results: ScanResultResponse | null;
  onDownloadReport: (format: 'csv' | 'json' | 'html' | 'excel') => void;
  onNewScan: () => void;
}

export default function DashboardPage({ results }: DashboardPageProps) {
  return <Dashboard results={results} />;
}
