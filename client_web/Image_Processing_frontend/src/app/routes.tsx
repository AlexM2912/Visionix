import { createBrowserRouter } from "react-router";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { MainLayout } from "./components/layouts/MainLayout";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { UploadPage } from "./components/pages/UploadPage";
import { ProcessingPage } from "./components/pages/ProcessingPage";
import { HistoryPage } from "./components/pages/HistoryPage";
import { ResultsPage } from "./components/pages/ResultsPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { AdminPage } from "./components/pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { index: true, Component: LoginPage },
      { path: "register", Component: RegisterPage },
    ],
  },
  {
    path: "/app",
    Component: MainLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "upload", Component: UploadPage },
      { path: "processing/:batchId", Component: ProcessingPage },
      { path: "history", Component: HistoryPage },
      { path: "results/:batchId", Component: ResultsPage },
      { path: "profile", Component: ProfilePage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
