import * as React from "react";
import { HistoryItem } from "../components/history-item";
import { useSetting } from "../components/hooks";
import { getVscodeApi } from "../utils/vscodeApi";
import { Button } from "../../components/ui/button";

const vscode = getVscodeApi();

const History = () => {
  const [historyList, setHistoryList] = React.useState<any>([]);

  const [loading, setLoading] = React.useState(true);

  const { setting, setSetting } = useSetting();

  React.useEffect(() => {
    vscode.postMessage({
      command: "history",
      postData: {
        category: setting.categoryId,
      },
    });
    window.addEventListener("message", (event: any) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "message") {
        alert(message.data.message);
      }

      if (message.command === "history") {
        setHistoryList(message.data);
      }
    });
  }, []);

  const goDetail = ({
    id,
    combineKey,
  }: {
    id?: number;
    combineKey?: string;
  }) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        id,
        combineKey,
        type: 1,
        router: "/detail",
      }
    });
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-gray-400">loading...</div>
        </div>
      ) : (
        <div className="menu-container">
          {historyList.map((item: any, index: number) => {
            return (
              <HistoryItem
                key={index}
                data={item}
                goExercise={(data) => {
                  goDetail({
                    combineKey: data?.key,
                  });
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
