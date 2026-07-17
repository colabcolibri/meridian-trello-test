import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AgileBoardView } from "../features/agile/ui/AgileBoardView";
import { ProjectHubPage } from "../features/agile/ui/ProjectHubPage";
import { ProjectListPage } from "../features/agile/ui/ProjectListPage";

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectHubPage />} />
        <Route path="/projects/:projectId/board" element={<AgileBoardView />} />
        <Route path="/projects/:projectId/sprints/:sprintId" element={<AgileBoardView />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
