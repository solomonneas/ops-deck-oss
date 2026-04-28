import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StarfieldBg from './components/StarfieldBg';
import Memory from './pages/Memory';
import Search from './pages/Search';
import Prompts from './pages/Prompts';
import Journal from './pages/Journal';
import RepoDetail from './pages/RepoDetail';
import Repos from './pages/Repos';
import Codebase from './pages/Codebase';
import Config from './pages/Config';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { DataSourceProvider } from './data-sources/DataSourceProvider';

export default function App() {
  return (
    <DataSourceProvider>
      <BrowserRouter>
        <StarfieldBg />
        <div className="relative z-10 flex min-h-screen w-full overflow-x-hidden">
          <Sidebar />
          <div className="mt-14 w-full min-w-0 flex-1 md:mt-0 md:ml-52">
            <TopBar />
            <main className="min-w-0 max-w-full overflow-x-hidden p-4 md:p-6">
              <PWAInstallPrompt />
              <Routes>
                <Route path="/" element={<Navigate to="/repos" replace />} />
                <Route path="/repos" element={<Repos />} />
                <Route path="/repos/:slug" element={<RepoDetail />} />
                <Route path="/codebase" element={<Codebase />} />
                <Route path="/search" element={<Search />} />
                <Route path="/prompts" element={<Prompts />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/config" element={<Config />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </DataSourceProvider>
  );
}
