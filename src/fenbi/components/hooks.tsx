import * as React from "react";

export interface TSetting {
  color?: string;
  backgroundColor?: string;
  categoryId?: string;
  [key: string]: any;
}

const defaultSetting: TSetting = {
  color: "#ffffff",
  backgroundColor: "#ffffff",
  categoryId: "xingce",
  needLineThrough: false,
  fontSize: 12,
};

const SettingContext = React.createContext<{
  setting: TSetting;
  setSetting: (s: TSetting) => void;
}>({
  setting: defaultSetting,
  setSetting: () => {},
});

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [setting, setSetting] = React.useState<TSetting>(defaultSetting);

  return (
    <SettingContext.Provider value={{ setting, setSetting }}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => React.useContext(SettingContext);