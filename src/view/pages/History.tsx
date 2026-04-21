import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HistoryItem } from "../components/history-item";
import { useSetting } from "../components/hooks";
import { getVscodeApi } from "../utils/vscodeApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const vscode = getVscodeApi();

// 考试类型
type ExamType = "shenlun" | "xingce";

const History = ({ categoryId }: { categoryId?: string }) => {
  const [historyList, setHistoryList] = React.useState<any>([]);
  const [paperList, setPaperList] = React.useState<any>([]);

  const [loading, setLoading] = React.useState(true);
  const [examType, setExamType] = React.useState<ExamType>("xingce");
  const [currentCategoryId, setCurrentCategoryId] = React.useState<string>(categoryId || "3");

  useSetting();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    vscode.postMessage({
      command: "history",
      postData: {
        categoryId: currentCategoryId,
        category: "xingce",
        count: 15,
      },
    });
  }, [currentCategoryId]);

  React.useEffect(() => {
    const handleMessage = (event: any) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "message") {
        alert(message.data.message);
      }

      if (message.command === "sendhistory") {
        console.log("history", JSON.stringify(message));
        setHistoryList(message.data.historyItems || []);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const goDetail = ({ exerciseKey }: { exerciseKey?: string }) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "createPanel",
      postData: {
        combineKey: exerciseKey,
        type: 1,
        examType: examType,
        router: "/detail",
      }
    });
  };

  return (
    <div>
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">练习历史</span>
        </div>
        <Select value={examType} onValueChange={(value: ExamType) => setExamType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shenlun">申论</SelectItem>
            <SelectItem value="xingce">行测</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-3">
        <div className="flex gap-2">
          <Link
            to="/history/exercise"
            className={`px-4 py-2 rounded-md transition-colors ${currentCategoryId === "3" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setCurrentCategoryId("3")}
          >
            练习
          </Link>
          <Link
            to="/history/paper"
            className={`px-4 py-2 rounded-md transition-colors ${currentCategoryId === "1" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setCurrentCategoryId("1")}
          >
            试卷
          </Link>
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-sm text-gray-400">loading...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {historyList.map((item: any, index: number) => {
              return (
                <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.sheetName}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>类型：{item.sheetType === 1 ? "试卷" : "练习"}</p>
                        <p>难度：{item.difficulty}</p>
                        <p>更新时间：{new Date(item.updatedTime).toLocaleDateString()}</p>
                        <p>共{item.questionCount}题, 答对：{item.correctCount}题</p>
                        <p>得分：{item.score}/{item.fullScore}</p>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant={item.status === 1 ? "secondary" : "default"}
                        onClick={() => {
                          if (item.status === 1) {
                            return;
                          }
                          goDetail({ exerciseKey: item.exerciseKey });
                        }}
                      >
                        {item.status === 1 ? "已完成" : "继续做题"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
