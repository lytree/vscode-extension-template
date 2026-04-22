import * as React from "react";
import { useLayoutEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { getVscodeApi } from "./utils/vscodeApi";

import "@/styles.css";

// 懒加载组件
const Tiku = React.lazy(() => import("./pages/Tiku"));
const History = React.lazy(() => import("./pages/History"));
const PastYears = React.lazy(() => import("./pages/PastYears"));

// 加载中组件
const Loading = () => (
  <div className="flex justify-center items-center h-32">
    <div className="text-sm text-muted-foreground">加载中...</div>
  </div>
);


// 主应用组件
const AppContent = () => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const vscode = getVscodeApi();

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("Received message from extension:", message);
      if (message.command === "navigate") {
        navigate(message.data.path);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  return (
    <div className="app p-4">
      <Routes>
        <Route path="/" element={
          <React.Suspense fallback={<Loading />}>
            <Tiku />
          </React.Suspense>
        } />
        <Route path="/history" element={
          <React.Suspense fallback={<Loading />}>
            <History />
          </React.Suspense>
        } />
        <Route path="/pastYears" element={
          <React.Suspense fallback={<Loading />}>
            <PastYears />
          </React.Suspense>
        } />
      </Routes>
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};