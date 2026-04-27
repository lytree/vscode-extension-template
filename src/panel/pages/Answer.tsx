import * as React from "react";
import type { TSolutionData, TQuestionData, TLastAnswerRecord } from "../../types";
import { QuestionItem } from "../components/question-item";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { groupByMaterialIndexesTo2DArray } from "../../view/utils/analyze";
import { useNavigate, useLocation } from "react-router-dom";



const vscode = getVscodeApi();
/**
 * 结果界面
 * @returns 
 */
function Answer() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // 处理从 navigate 传递过来的数据
  React.useEffect(() => {
    if (location.state?.solutionData) {
      setSolutionData(location.state.solutionData);
      setLoading(false);
    }
  }, [location.state]);

  // 统一处理所有消息
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      setLoading(false);


      if (message.command === "getSolution") {
        setSolutionData(message.data);
        console.log("Received solution data:", message.data);
      }

      if (message.command === "message") {
        // 处理错误消息
        console.error("Error message:", message.data.message);
        alert(message.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    // 向扩展发送路由就绪消息
    vscode.postMessage({ command: 'answerReady' });

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const onBack = () => {
    // 关闭 Panel
    vscode.postMessage({ command: "closePanel" });
  };
  const onJump = () => {
    vscode.postMessage({
      command: "jumpFenbi",
      postData: {
        category: "xingce",
        exerciseId: solutionData?.exerciseId,
      },
    });
  };

  const onDownload = () => {
    // 下载功能
    vscode.postMessage({ command: "download" });
  };


  const solutions = groupByMaterialIndexesTo2DArray(
    solutionData?.solutions || []
  );
  return (
    <div className="h-full bg-card flex flex-col">
      {/* 顶部标题栏 */}
      <div className="top-bar flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-lg font-medium"></h1>
        <div className="flex gap-2">
          <Button variant="secondary"
            onClick={onDownload}
            className="text-secondary-foreground hover:bg-secondary/80"
          >
            下载
          </Button>
        </div>
      </div>

      {/* 题目容器 */}
      <div className="question-container flex-1 overflow-y-auto p-4">
        {(solutions || []).map((group: any[], groupIndex: number) => {
          return (group || []).map((item: any, itemIndex: number) => {
            const questionIndex = solutionData?.solutions?.findIndex((q: any) => q.id === item.id) ?? itemIndex;
            return (
              <Card key={`${groupIndex}-${itemIndex}`} className="mb-6 rounded-lg shadow-sm">
                <CardHeader className="flex justify-between items-start gap-4 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary font-medium">{questionIndex + 1}.</span>
                    <span className="text-sm text-muted-foreground">单选题</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionItem
                    onChange={() => { }}
                    data={item}
                    questionIndex={questionIndex}
                    materials={solutionData?.materials || []}
                    materialIndex={item.materialIndexes?.[0] || 0}
                    userAnswer={(solutionData?.userAnswers || {})[item.globalId]}
                    disabled={true}
                  />
                </CardContent>
              </Card>
            );
          });
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