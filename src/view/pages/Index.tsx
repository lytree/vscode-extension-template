import * as React from "react";
import { TCacheData, TSetting } from "../types/index.js";
import { QuestionCount } from "../components/question-count.js";
import { CustomTree } from "../components/custom-tree.js";
import { HistoryCard } from "../components/history-card.js";
import { useNavigate } from "react-router-dom";
import { useSetting } from "../components/hooks.js";
import { categoryOptions } from "../utils/constant.js";
import { getVscodeApi } from "../utils/vscodeApi.js";
import { modifyArrayToTree } from "../utils/modifyArray.tsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const vscode = getVscodeApi();

export const Home = () => {
  const [historyList, setHistoryList] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(true);

  const [treeData, setTreeData] = React.useState([]);
  const [cacheData, setCacheData] = React.useState<TCacheData>();
  const { setting, setSetting } = useSetting();

  const navigate = useNavigate();

  React.useEffect(() => {
    pageInit({ categoryId: setting.categoryId });
    getHistory({ count: 15, categoryId: 4 });
    window.addEventListener("message", (event: any) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "setting") setTheme(message.data);
      if (message.command === "init") {
        const menu = message.data.menu;
        const cacheResult = message.data.cacheResult;
        const _data = modifyArrayToTree(menu, cacheResult || {}, treeClick);
        setTreeData(_data as any);
      }
      if (message.command === "pageCache") {
        setCacheData(message.data);
      }
      if (message.command === "message") {
        pageInit({ categoryId: setting.categoryId });
        alert(message.data.message);
      }
      if (message.command === "history") {
        setHistoryList(message.data);
      }
    });
  }, []);

  const setTheme = (theme: TSetting) => {
    setSetting((prev: any) => ({ ...prev, ...theme }));

    document.documentElement.style.setProperty(
      "--primary-color",
      theme.color || "#ffffff",
    );
    document.documentElement.style.setProperty(
      "--primary-backgroundColor",
      theme.backgroundColor || "#ffffff",
    );
    document.documentElement.style.setProperty(
      "--primary-fontSize",
      `${theme.fontSize || 12}px`,
    );
  };

  const pageInit = (postData?: any) => {
    vscode.postMessage({
      command: "pageInit",
      postData,
    });
  };

  const treeClick = (e: any, cacheResult: any) => {
    const key = e.id;

    setLoading(true);
    let combineKey: string | null = null;
    const len = cacheResult?.keypointIds?.length || 0;
    if (len > 0 && cacheResult?.keypointIds?.includes(key)) {
      combineKey = cacheResult?.combineKey || "";
    }
    goDetail({ id: Number(key), combineKey: combineKey || "" });
  };

  const onQuestionCountChange = (e: number) => {
    setLoading(true);
    vscode.postMessage({
      command: "changeQuestionCount",
      postData: {
        questionCount: e,
      },
    });
  };

  const goHistory = () => {
    navigate("/history", {
      state: {
        count: 15,
        categoryId: 3,
      },
    });
  };

  const goDetail = ({
    id,
    combineKey,
    type,
  }: {
    id?: number;
    combineKey?: string;
    type?: number;
  }) => {
    navigate("/detail", {
      state: {
        id,
        combineKey,
        type,
      },
    });
  };

  const getHistory = ({
    count,
    categoryId,
    category,
  }: {
    category?: string;
    count?: number;
    categoryId?: number;
  }) => {
    vscode.postMessage({
      command: "history",
      postData: {
        category: category || setting.categoryId,
        count,
        categoryId,
      },
    });
  };

  const onChangeCategory = (value: string) => {
    pageInit({
      categoryId: value,
    });
    vscode.postMessage({
      command: "changeCategory",
      postData: {
        categoryId: value,
      },
    });
    getHistory({ count: 15, categoryId: 4, category: value });
    setSetting((prev: any) => ({ ...prev, categoryId: value }));
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-gray-400">loading...</div>
        </div>
      ) : (
        <div>
          <div className="flex justify-end items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                vscode.postMessage({
                  command: "openInBrowser",
                  postData: {
                    url: "https://github.com/Mrxiiaobai/fenbi-tools/issues",
                  },
                });
              }}
            >
              问题反馈
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                vscode.postMessage({
                  command: "openInBrowser",
                  postData: {
                    url: "https://github.com/Mrxiiaobai/fenbi-tools/issues/9",
                  },
                });
              }}
            >
              入群交流
            </Button>
          </div>
          <div className="flex justify-start items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                goDetail({
                  type: 2,
                });
              }}
            >
              快速练习
            </Button>
          </div>
          <Select
            value={setting.categoryId || "xingce"}
            onValueChange={onChangeCategory}
            className="w-32 m-2.5"
          >
            <SelectTrigger>
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {setting.categoryId == "shenlun" && (
            <div className="text-sm text-gray-400 mb-4">
              ps：申论功能需要前往粉笔官网充vip才能交卷，与该插件无关，由于没有vip，交卷及后续功能暂无法支持，感谢理解！
            </div>
          )}
          <div className="menu-container">
            <HistoryCard
              onClick={goHistory}
              data={historyList}
              goExercise={(data) => {
                goDetail({
                  type: 1,
                  combineKey: data?.key,
                });
              }}
            />
            <QuestionCount onChange={onQuestionCountChange} />
            <CustomTree treeData={treeData} />
          </div>
        </div>
      )}
    </div>
  );
};