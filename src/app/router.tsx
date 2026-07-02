import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { BoardListPage } from "../features/boards/ui/BoardListPage";
import { BoardView } from "../features/boards/ui/BoardView";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BoardListPage />} />
        <Route path="/boards/:boardId" element={<BoardView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
