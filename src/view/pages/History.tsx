import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getVscodeApi } from "../utils/vscodeApi";
import { EXAM_TYPES, type ExamType } from "../../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const vscode = getVscodeApi();

const History = ({ categoryId }: { categoryId?: string }) => {
  const [historyList, setHistoryList] = React.useState<any>([]);
  const [paperList, setPaperList] = React.useState<any>([]);

  const [loading, setLoading] = React.useState(true);
  const [examType, setExamType] = React.useState<ExamType>("xingce");
  const [currentCategoryId, setCurrentCategoryId] = React.useState<string>(categoryId || "3");

  // 下拉加载状态
  const [currentcursor, setCurrentcursor] = React.useState<string>("");
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);


  React.useEffect(() => {
    // 重置状态
    setLoading(true);
    setCurrentcursor("");
    setHistoryList([]);
    setHasMore(true);

    vscode.postMessage({
      command: "history:getHistory",
      postData: {
        categoryId: currentCategoryId,
        category: "xingce",
        cursor: "",
        count: 15,
      },
    });
  }, [currentCategoryId]);

  // 加载更多数据
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      vscode.postMessage({
        command: "history:getHistory",
        postData: {
          categoryId: currentCategoryId,
          category: "xingce",
          cursor: currentcursor,
          count: 15,
        },
      });
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: any) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "message") {
        alert(message.data.message);
      }

      if (message.command === "history:data") {

        const newItems = message.data.historyItems || [];

        if (currentcursor) {
          // 加载更多数据，追加到现有列表
          setHistoryList((prev: any) => [...prev, ...newItems]);
        } else {
          // 首次加载数据，替换整个列表
          setHistoryList(newItems);
        }

        setCurrentcursor(message.data.cursor || null);
        setHasMore(!!message.data.cursor);
        setLoading(false);
        setLoadingMore(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [currentcursor]);

  // 滚动监听，实现下拉加载
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;

      // 当滚动到距离底部 100px 时加载更多
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadingMore, hasMore, currentcursor, currentCategoryId]);

  const goDetail = ({ exerciseKey }: { exerciseKey?: string }) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "history:Detail",
      postData: {
        combineKey: exerciseKey,
        type: 1,
        category: examType,
        router: "/detail",
      }
    });
  };
  const goAnswer = ({ exerciseKey }: { exerciseKey?: string }) => {
    // 发送消息到扩展，创建 Panel 并传入参数
    vscode.postMessage({
      command: "history:Answer",
      postData: {
        combineKey: exerciseKey,
        type: 1,
        category: examType,
        router: "/answer",
      }
    });
  };
  return (
    <div>
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">练习历史</span>
        </div>
        <Select items={EXAM_TYPES} value={examType} onValueChange={(value: ExamType) => setExamType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue>

            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXAM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="p-3">
        <div className="flex gap-2">
          <Button
            className={`px-4 py-2 rounded-md transition-colors ${currentCategoryId === "3" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setCurrentCategoryId("3")}
          >
            练习
          </Button>
          <Button
            className={`px-4 py-2 rounded-md transition-colors ${currentCategoryId === "1" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setCurrentCategoryId("1")}
          >
            试卷
          </Button>
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
                            goAnswer({ exerciseKey: item.exerciseKey });
                          } else {
                            goDetail({ exerciseKey: item.exerciseKey });
                          }
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

        {/* 加载更多提示 */}
        {loadingMore && (
          <div className="mt-4 flex justify-center items-center py-4">
            <div className="text-sm text-muted-foreground">加载更多中...</div>
          </div>
        )}

        {!loadingMore && !hasMore && (
          <div className="mt-4 flex justify-center items-center py-4">
            <div className="text-sm text-muted-foreground">没有更多数据了</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
