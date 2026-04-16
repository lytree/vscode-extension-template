import * as React from "react";
import { getVscodeApi } from "../utils/vscodeApi";

const vscode = getVscodeApi();

export interface TSetting {
  color?: string;
  backgroundColor?: string;
  categoryId?: string;
  [key: string]: any;
}

export interface TTheme {
  isDark: boolean;
  theme: number;
}

const defaultSetting: TSetting = {
  color: "#ffffff",
  backgroundColor: "#ffffff",
  categoryId: "xingce",
  needLineThrough: false,
  fontSize: 12,
};

const defaultTheme: TTheme = {
  isDark: true,
  theme: 2, // 2 = Dark theme
};

const SettingContext = React.createContext<{
  setting: TSetting;
  setSetting: (s: TSetting) => void;
  theme: TTheme;
  setTheme: (t: TTheme) => void;
}>({
  setting: defaultSetting,
  setSetting: () => { },
  theme: defaultTheme,
  setTheme: () => { },
});

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [setting, setSetting] = React.useState<TSetting>(defaultSetting);
  const [theme, setTheme] = React.useState<TTheme>(defaultTheme);

  // 监听来自扩展的消息
  React.useEffect(() => {
    const handleMessage = (event: any) => {
      const message = event.data;

      if (message.command === "setting") {
        setSetting(message.data);
      }

      if (message.command === "themeChange") {
        setTheme(message.data);
      }
    };

    window.addEventListener("message", handleMessage);

    // 初始化时请求设置和主题
    vscode.postMessage({ command: "pageInit" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // 当主题变化时，更新字体颜色和背景颜色
  React.useEffect(() => {
    // 使用 VSCode 的主题色和字体设置
    const vscodeColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-foreground').trim();
    const vscodeBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background').trim();
    const vscodeFontSize = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-font-size').trim();

    // 更新 CSS 变量
    document.documentElement.style.setProperty(
      "--primary-color",
      setting.color || vscodeColor
    );
    document.documentElement.style.setProperty(
      "--primary-backgroundColor",
      setting.backgroundColor || vscodeBackgroundColor
    );
    document.documentElement.style.setProperty(
      "--primary-fontSize",
      `${setting.fontSize || vscodeFontSize || 12}px`
    );
  }, [theme, setting]);

  return (
    <SettingContext.Provider value={{ setting, setSetting, theme, setTheme }}>
      <div className={theme.isDark ? "dark" : "light"}>
        {children}
      </div>
    </SettingContext.Provider>
  );
};

export const useSetting = () => React.useContext(SettingContext);