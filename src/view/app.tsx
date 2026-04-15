import * as React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import { Home } from "./pages/Index.js";
import { History } from "./pages/History.js";
import { Detail } from "./pages/Detail.js";
import { Answer } from "./pages/Answer.js";
import { SettingProvider } from "./components/hooks.js";

import "./style/index.css";

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