import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StarfieldBg from './components/StarfieldBg';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Services from './pages/Services';
import Memory from './pages/Memory';
import Usage from './pages/Usage';
import Search from './pages/Search';
import Prompts from './pages/Prompts';
import Social from './pages/Social';
import Journal from './pages/Journal';
import Diary from './pages/Diary';
import Security from './pages/Security';
import Architecture from './pages/Architecture';
import AgentPlaybook from './pages/AgentPlaybook';
import Stories from './pages/Stories';
import NetworkIntel from './pages/NetworkIntel';
import SeuIntel from './pages/SeuIntel';
import RepoDetail from './pages/RepoDetail';
import Business from './pages/Business';
import Repos from './pages/Repos';
import Variants from './pages/Variants';
import Codebase from './pages/Codebase';
import AgentIntel from './pages/AgentIntel';
import Install from './pages/Install';
import Boc from './pages/Boc';
import Observability from './pages/Observability';
import Config from './pages/Config';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  return (
    <BrowserRouter>
      <StarfieldBg />
      <div className="relative z-10 flex min-h-screen w-full overflow-x-hidden">
        <Sidebar />
        <div className="mt-14 w-full min-w-0 flex-1 md:mt-0 md:ml-52">
          <TopBar />
          <main className="min-w-0 max-w-full overflow-x-hidden p-4 md:p-6">
            <PWAInstallPrompt />
            <Routes>
              <Route path="/" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/services" element={<Services />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/social" element={<Social />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/security" element={<Security />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/agents" element={<AgentPlaybook />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/network" element={<NetworkIntel />} />
              <Route path="/seu" element={<SeuIntel />} />
              <Route path="/business" element={<Business />} />
              <Route path="/boc" element={<Boc />} />
              <Route path="/install" element={<Install />} />
              <Route path="/repos" element={<Repos />} />
              <Route path="/repos/:slug" element={<RepoDetail />} />
              <Route path="/variants" element={<Variants />} />
              <Route path="/codebase" element={<Codebase />} />
              <Route path="/intel" element={<AgentIntel />} />
              <Route path="/observability" element={<Observability />} />
              <Route path="/config" element={<Config />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
