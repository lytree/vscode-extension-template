import { Routes, Route, HashRouter } from "react-router-dom";
import { Home } from "./pages/Index";
import { History } from "./pages/History";
import { Detail } from "./pages/Detail";
import { Answer } from "./pages/Answer";
import { SettingProvider } from "./components/hooks";

import "@/styles.css";

export const App = () => {
  return (
    <SettingProvider>
      <div className="app">
        <HashRouter>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/history" element={<History />} />
            <Route path="/answer" element={<Answer />} />
          </Routes>
        </HashRouter>
      </div>
    </SettingProvider>
  );
};