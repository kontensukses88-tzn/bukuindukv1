import React from 'react';
import { CatatanSiswaView } from './components/CatatanSiswaView';
import { DashboardView } from './components/DashboardView';
import { DataAwalView } from './components/DataAwalView';
import { DataLengkapSiswaView } from './components/DataLengkapSiswaView';
import { DataSekolahView } from './components/DataSekolahView';
import { DataSiswaView } from './components/DataSiswaView';
import { IntegrasiDatabaseView } from './components/IntegrasiDatabaseView';
import { PrintBukuIndukDengan } from './components/PrintBukuIndukDengan';
import { PrintBukuIndukTanpa } from './components/PrintBukuIndukTanpa';
import { PrintCover } from './components/PrintCover';
import { PrintIdentitas } from './components/PrintIdentitas';
import { PrintIndexSiswa } from './components/PrintIndexSiswa';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  switch (activeView) {
    case 'data-awal':
      return <DataAwalView />;
    case 'data-sekolah':
      return <DataSekolahView />;
    case 'data-siswa':
      return <DataSiswaView />;
    case 'data-lengkap-siswa':
      return <DataLengkapSiswaView />;
    case 'catatan-siswa':
      return <CatatanSiswaView />;
    case 'integrasi-database':
      return <IntegrasiDatabaseView />;
    case 'print-cover':
      return <PrintCover />;
    case 'print-identitas':
      return <PrintIdentitas />;
    case 'print-index':
      return <PrintIndexSiswa />;
    case 'print-buku-induk-tanpa':
      return <PrintBukuIndukTanpa />;
    case 'print-buku-induk-dengan':
      return <PrintBukuIndukDengan />;
    case 'dashboard':
    default:
      return <DashboardView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
