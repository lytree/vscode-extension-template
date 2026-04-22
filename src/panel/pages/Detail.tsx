import * as React from "react";
import type { TSolutionData, TQuestionData, TQuestionItem, TLastAnswerRecord } from "../../types";
import { QuestionItem } from "../components/question-item";
import { ShenlunItem } from "../components/shenlun-item";
import { CanvasDrawing } from "../components/canvas-drawing";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { groupByMaterialIndexesTo2DArray } from "../../view/utils/analyze";
import { useNavigate } from "react-router-dom";



const vscode = getVscodeApi();
/**
 * 答题界面
 * @returns 
 */
function Detail() {
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
  const [combineKey, setCombineKey] = React.useState<string>("");

  // 统一处理所有消息
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Detail received message:', message);
      setLoading(false);

      if (message.command === "detailInit") {
        const { id, name, type } = message.postData;
        // 处理从 Index 页面传递过来的参数
        console.log("Panel initialized with params:", message.postData);
        // 调用 getQuestion 函数获取问题信息
        getQuestion({ category: "xingce", id, type });
      }

      if (message.command === "getQuestion") {
        setQuestionData(message.data);
        setCombineKey(message.data.combineKey);
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
    vscode.postMessage({ command: 'detailReady' });

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  React.useEffect(() => {
    if (isFirst) return;
    if ((questionData?.questions || []).length > 0) {
      setFirst(true);
      setStartTime(Date.now());
    }
  }, [questionData?.questions]);

  const getQuestion = ({
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
    if (type == 2) {
      vscode.postMessage({
        command: "getQuickQuestion",
        postData: { category, combineKey },
      });
      return;
    }
    vscode.postMessage({
      command: "getQuestion",
      postData: { category, id, combineKey },
    });
  };

  const onBack = () => {
    // 关闭 Panel
    vscode.postMessage({ command: "closePanel" });
  };

  const onRaioChange = (e: any, item: TQuestionItem, index: number) => {
    console.log("选项变化：", e.target.value, "题目：", item, "索引：", index);
    vscode.postMessage({
      command: "answer",
      inc: true,
      postData: {
        ...item,
        startTime: startTime,
        combineKey: combineKey,
        category: "xingce",
        answer: e.target.value,
        exerciseId: questionData?.exerciseId,
      },
    });
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

  const onSubmit = () => {
    if (window.confirm("确认提交？")) {
      setLoading(true);
      vscode.postMessage({
        command: "submit",
        postData: {
          startTime: startTime,
          combineKey: combineKey,
          category: "xingce",
        },
      });
    }
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

  const questions = groupByMaterialIndexesTo2DArray(
    questionData?.questions || []
  );


  if (loading) {
    return (
      <div className="h-full bg-card p-4 flex items-center justify-center">
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
    <div className="h-full bg-card p-4">
      <h1 className="text-lg font-medium"></h1>
      <div className="top-bar flex justify-between items-center mb-4">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          返回上一页
        </Button>

        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            onClick={onSubmit}
          >
            交卷
          </Button>
          <Button
            variant="secondary"
            onClick={onJump}
          >
            跳转粉笔网址
          </Button>
        </div>
      </div>
      <div className="question-container overflow-y-auto max-h-[calc(100%-120px)]">
        {(questions || []).map((item: any, index: number) => {
          if (false) {
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
                onChange={onRaioChange}
                data={item}
                index={index}
                materials={questionData?.materials || []}
              />
            </div>
          );
        })}
      </div>

      <CanvasDrawing onClose={() => { }} />
    </div>

  );
}

export default Detail