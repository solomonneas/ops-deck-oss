import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { BacklogPage } from "./pages/BacklogPage";
import { CodeSearchPage } from "./pages/CodeSearchPage";
import { CronCalendarPage } from "./pages/CronCalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InfrastructurePage } from "./pages/InfrastructurePage";
import { IntelFeedPage } from "./pages/IntelFeedPage";
import { JournalPage } from "./pages/JournalPage";
import { MemoryPage } from "./pages/MemoryPage";
import { PromptsPage } from "./pages/PromptsPage";
import { SecurityPage } from "./pages/SecurityPage";
import { WorkspacePage } from "./pages/WorkspacePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "cron-calendar", element: <CronCalendarPage /> },
      { path: "intel-feed", element: <IntelFeedPage /> },
      { path: "security", element: <SecurityPage /> },
      { path: "infrastructure", element: <InfrastructurePage /> },
      { path: "memory", element: <MemoryPage /> },
      { path: "journal", element: <JournalPage /> },
      { path: "workspace", element: <WorkspacePage /> },
      { path: "code-search", element: <CodeSearchPage /> },
      { path: "prompts", element: <PromptsPage /> },
      { path: "backlog", element: <BacklogPage /> }
    ]
  }
]);
