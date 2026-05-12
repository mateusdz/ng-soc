import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Dashboard from "../pages/Dashboard";
import PlaybookDetail from "../pages/PlaybookDetail";
import PlaybookLibrary from "../pages/PlaybookLibrary";
import RoasterHost from "../pages/RoasterHost";
import Settings from "../pages/Settings";
import SoarcaGuiHost from "../pages/SoarcaGuiHost";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/playbooks" element={<PlaybookLibrary />} />
        <Route path="/playbooks/:playbookId" element={<PlaybookDetail />} />
        <Route path="/roaster/*" element={<RoasterHost />} />
        <Route path="/executions/*" element={<SoarcaGuiHost />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Shell>
  );
}
