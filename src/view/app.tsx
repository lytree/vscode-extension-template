import { Routes, Route, HashRouter } from "react-router-dom";
import { Home } from "./pages/Index";
import { History } from "./pages/History";
import { SettingProvider } from "./components/hooks";

import "@/styles.css";

export const App = () => {
  return (
    <SettingProvider>
      <div className="app">
        <HashRouter>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </HashRouter>
      </div>
    </SettingProvider>
  );
};