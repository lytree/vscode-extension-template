import * as React from "react";
import type { TSolutionData, TQuestionData, TLastAnswerRecord } from "../../types";
import { QuestionItem } from "../components/question-item";
import { ShenlunItem } from "../components/shenlun-item";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../../components/ui/card";
import { groupByMaterialIndexesTo2DArray } from "../../view/utils/analyze";
import { useNavigate } from "react-router-dom";



const vscode = getVscodeApi();
/**
 * 结果界面
 * @returns 
 */
function Answer() {
  const navigate = useNavigate();
  const [isFirst, setFirst] = React.useState(false);
  const [startTime, setStartTime] = React.useState(0);
  const [lastAnswerRecord, setLastAnswerRecord] = React.useState<TLastAnswerRecord>({
    lastCount: null,
    lastAnswer: null,
    lastQuestionId: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [questionData, setQuestionData] = React.useState<TQuestionData | null>(null);
  const [solutionData, setSolutionData] = React.useState<TSolutionData | null>(null);
  const [combineKey, setCombineKey] = React.useState<string>("");

  // 统一处理所有消息
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Answer received message:', message);
      setLoading(false);

      if (message.command === "answerInit") {
        const { id, name, type } = message.postData;
        // 处理从 Index 页面传递过来的参数
        console.log("Panel initialized with params:", message.postData);
        // 调用 getSolution 函数获取问题信息
        getSolution({ category: "xingce", id, type });
      }

      if (message.command === "getQuestion") {
        setQuestionData(message.data);
        setCombineKey(message.data.combineKey);
      }

      if (message.command === "solution") {
        setSolutionData(message.data);
      }

      if (message.command === "message") {
        // 处理错误消息
        console.error("Error message:", message.data.message);
        alert(message.data.message);
      }

      if (message.command === "navigate") {
        // 处理路由跳转
        const { path, state } = message.data;
        console.log("Navigating to:", path, "with state:", state);
        navigate(path, { state });
      }
    };

    window.addEventListener("message", handleMessage);
    // 向扩展发送路由就绪消息
    vscode.postMessage({ command: 'answerReady' });

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const getSolution = ({
    category,
    id,
    combineKey,
    type = 1,
  }: {
    category?: string;
    id?: number;
    combineKey?: string | null;
    type?: number;
  }) => {
    setLoading(true);
    vscode.postMessage({
      command: "getSolution",
      postData: { type, category, id, combineKey },
    });
  };

  const onBack = () => {
    // 关闭 Panel
    vscode.postMessage({ command: "closePanel" });
  };

  const onShenlunChange = (text: string) => {
    vscode.postMessage({
      command: "answer",
      inc: true,
      postData: {
        startTime: startTime,
        combineKey: combineKey,
        category: "xingce",
        answer: text,
      },
    });
  };

  const onJump = () => {
    vscode.postMessage({
      command: "jumpFenbi",
      postData: {
        category: "xingce",
        exerciseId: questionData?.exerciseId,
      },
    });
  };

  const onSetting = () => {
    // 打开设置
    vscode.postMessage({ command: "openSetting" });
  };

  const onDownload = () => {
    // 下载功能
    vscode.postMessage({ command: "download" });
  };

  const onSubmit = () => {
    // 交卷功能
    vscode.postMessage({ command: "submit" });
  };

  const solutions = groupByMaterialIndexesTo2DArray(
    solutionData?.solutions || []
  );

  return (
    <div className="h-full bg-card flex flex-col" style={{ color: setting?.color, fontSize: setting?.fontSize }}>
      {/* 顶部标题栏 */}
      <div className="top-bar flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-lg font-medium"></h1>
        <div className="flex gap-2">
          <Button
            onClick={onSetting}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            设置
          </Button>
          <Button variant="secondary"
            onClick={onDownload}
            className="text-secondary-foreground hover:bg-secondary/80"
          >
            下载
          </Button>
          <Button
            variant="secondary"
            onClick={onSubmit}
            className="text-primary-foreground hover:bg-primary/80"
          >
            交卷
          </Button>
        </div>
      </div>

      {/* 题目容器 */}
      <div className="question-container flex-1 overflow-y-auto p-4">
        {(solutions || []).map((item: any, index: number) => {
          if (false) {
            return (
              <Card key={`${page}-${index}`} className="mb-6 rounded-lg shadow-sm">
                <CardHeader className="flex justify-between items-start gap-4 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary font-medium">{index + 1}.</span>
                    <span className="text-sm text-muted-foreground">单选题</span>
                  </CardTitle>
                  <CardAction className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      标记
                    </Button>
                    <Button
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      ★
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <ShenlunItem
                    onChange={onShenlunChange}
                    data={item}
                    index={index}
                    materials={questionData?.materials || []}
                  />
                </CardContent>
              </Card>
            );
          }
          return (
            <Card key={`${page}-${index}`} className="mb-6 rounded-lg shadow-sm">
              <CardHeader className="flex justify-between items-start gap-4 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-primary font-medium">{index + 1}.</span>
                  <span className="text-sm text-muted-foreground">单选题</span>
                </CardTitle>
                <CardAction className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    标
                  </Button>
                  <Button
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    记
                  </Button>
                  <Button
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    ★
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <QuestionItem
                  onChange={() => { }}
                  data={item}
                  index={index}
                  materials={questionData?.materials || []}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部答题卡 */}
      <div className="bottom-bar border-t border-border p-4 bg-card">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={onBack}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              返回上一页
            </Button>
            <Button
              onClick={onJump}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              跳转粉笔网址
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              答题卡
              <span className="text-muted-foreground ml-2">{solutionData?.correctCount || 0}/{solutionData?.questionCount || 0}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: solutionData?.questionCount || 0 }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  className="w-6 h-6 p-0 flex items-center justify-center"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Answer