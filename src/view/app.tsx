import * as React from "react";
import { useLayoutEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { SettingProvider } from "./components/hooks";
import { Button } from "@/components/ui/button";
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

  // 添加消息监听器，用于接收来自扩展的导航命令
  useLayoutEffect(() => {
    const vscode = getVscodeApi();

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("Received message from extension:", message);
      if (message.command === "navigate") {
        // 执行路由跳转
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
      {/* <Navigation /> */}
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
    <SettingProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingProvider>
  );
};
