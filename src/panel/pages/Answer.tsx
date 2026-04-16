import * as React from "react";
import type { TSolutionData, TQuestionData } from "../../types";
import { QuestionItem } from "../components/question-item";
import { ShenlunItem } from "../components/shenlun-item";
import { useSetting } from "../../view/components/hooks";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { groupByMaterialIndexesTo2DArray } from "../../view/utils/analyze";
import { useNavigate } from "react-router-dom";

interface TLastAnswerRecord {
  lastCount: number | null;
  lastAnswer: number | null;
  lastQuestionId: number | null | undefined;
}

const vscode = getVscodeApi();

function Answer() {
  const { setting } = useSetting();
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
      
      if (message.command === "panelInit" || message.command === "answerInit") {
        const { id, name, type } = message.postData;
        // 处理从 Index 页面传递过来的参数
        console.log("Panel initialized with params:", message.postData);
        // 调用 getSolution 函数获取问题信息
        getSolution({ category: setting?.categoryId, id, type });
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

    return () => window.removeEventListener("message", handleMessage);
  }, [setting?.categoryId, navigate]);

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
        category: setting?.categoryId,
        answer: text,
      },
    });
  };

  const onJump = () => {
    vscode.postMessage({
      command: "jumpFenbi",
      postData: {
        category: setting?.categoryId,
        exerciseId: questionData?.exerciseId,
      },
    });
  };

  const solutions = groupByMaterialIndexesTo2DArray(
    solutionData?.solutions || []
  );

  if (loading) {
    return (
      <div className="h-full bg-card p-4 flex items-center justify-center" style={{ color: setting?.color, fontSize: setting?.fontSize }}>
        <div className="flex flex-col items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <p className="text-foreground mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card p-4" style={{ color: setting?.color, fontSize: setting?.fontSize }}>
      <div className="top-bar flex justify-between items-center mb-4">
        <Button
          onClick={onBack}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          返回上一页
        </Button>
        <Button
          onClick={onJump}
          className="bg-primary text-primary-foreground hover:bg-primary/80"
        >
          跳转粉笔网址
        </Button>
      </div>
      
      {solutionData && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-foreground">
            答对题目数：{solutionData.correctCount} / {solutionData.questionCount}
          </p>
        </div>
      )}
      
      <div className="question-container overflow-y-auto max-h-[calc(100%-120px)]">
        {(solutions || []).map((item: any, index: number) => {
          if (setting?.categoryId === "shenlun") {
            return (
              <div key={`${page}-${index}`} className="question-item mb-6">
                <ShenlunItem
                  onChange={onShenlunChange}
                  data={item}
                  index={index}
                  materials={questionData?.materials || []}
                />
              </div>
            );
          }
          return (
            <div key={`${page}-${index}`} className="question-item mb-6">
              <QuestionItem
                onChange={() => {}}
                data={item}
                index={index}
                materials={questionData?.materials || []}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Answer