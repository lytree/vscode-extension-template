import * as React from "react";
import { HistoryItem } from "../components/history-item";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetting } from "../components/hooks";
import { getVscodeApi } from "../utils/vscodeApi";
import { Button } from "@/components/ui/button";

const vscode = getVscodeApi();

export const History = () => {
  const [historyList, setHistoryList] = React.useState<any>([]);

  const [loading, setLoading] = React.useState(true);

  const { setting, setSetting } = useSetting();

  const navigate = useNavigate();
  const location = useLocation();
  const { count, categoryId } = location.state || {};

  React.useEffect(() => {
    vscode.postMessage({
      command: "history",
      postData: {
        category: setting.categoryId,
        count: count,
        categoryId: categoryId,
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
    navigate("/detail", {
      state: {
        id,
        combineKey,
      },
    });
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-gray-400">loading...</div>
        </div>
      ) : (
        <div className="menu-container">
          <Button variant="ghost" onClick={onBack}>
            返回上一页
          </Button>
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