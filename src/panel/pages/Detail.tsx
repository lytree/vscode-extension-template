import * as React from "react";
import type { TQuestionData, TQuestionItem, TLastAnswerRecord, TUserAnswerItem } from "../../types";
import { QuestionItem } from "../components/question-item";
import { CanvasDrawing } from "../components/canvas-drawing";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { AlertDialog } from "../../components/ui/alert-dialog";
import { groupByMaterialIndexesTo2DArray } from "../../view/utils/analyze";
import { setImg } from "../../view/utils/setImg";
import { useNavigate } from "react-router-dom";

const vscode = getVscodeApi();

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
  const [questionData, setQuestionData] = React.useState<TQuestionData | null>(null);
  const [combineKey, setCombineKey] = React.useState<string>("");
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [activeTabMap, setActiveTabMap] = React.useState<Record<string, string>>({});
  const scrollContainerRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrollingToTab = React.useRef(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "getQuestion") {
        setQuestionData(message.data);
        setCombineKey(message.data.combineKey);
      }

      if (message.command === "solution") {
        navigate("/answer", { state: { solutionData: message.data } });
      }

      if (message.command === "message") {
        console.error("Error message:", message.data.message);
        alert(message.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "detailReady" });

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  React.useEffect(() => {
    if (isFirst) return;
    if ((questionData?.questions || []).length > 0) {
      setFirst(true);
      setStartTime(Date.now());
    }
  }, [questionData?.questions]);

  const onBack = () => vscode.postMessage({ command: "closePanel" });

  const onRadioChange = (e: any, item: TQuestionItem, index: number) => {
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

  const onSubmit = () => setShowSubmitConfirm(true);

  const handleConfirmSubmit = () => {
    setLoading(true);
    vscode.postMessage({
      command: "submit",
      postData: {
        startTime: startTime,
        combineKey: combineKey,
        category: "xingce",
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

  const questions = groupByMaterialIndexesTo2DArray(questionData?.questions || []);

  const hasSharedMaterial = React.useMemo(() => {
    return (questionData?.questions || []).some(
      (q) => q.materialIndexes && q.materialIndexes.length > 0 && q.materialIndexes[0] > 0
    );
  }, [questionData?.questions]);

  const getUserAnswer = (globalId: string): TUserAnswerItem | undefined => {
    return (questionData?.userAnswers || {})[globalId] as TUserAnswerItem | undefined;
  };

  const getActiveTab = (groupKey: string, cards: { globalId: string }[]) => {
    if (activeTabMap[groupKey]) return activeTabMap[groupKey];
    return cards[0]?.globalId ?? "";
  };

  const findGroupIndexByGlobalId = (globalId: string): number => {
    return questions.findIndex((group: any[]) => group.some((item: any) => item.globalId === globalId));
  };

  const handleScrollUpdate = (groupIndex: number) => {
    if (isScrollingToTab.current) return;
    const container = scrollContainerRefs.current.get(groupIndex);
    if (!container) return;

    const panels = container.querySelectorAll<HTMLElement>("[data-question-id]");
    if (panels.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    let topPanel: HTMLElement | null = null;
    let minDist = Infinity;

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top);
      if (dist < minDist) {
        minDist = dist;
        topPanel = panel;
      }
    });

    if (topPanel) {
      const globalId = topPanel.getAttribute("data-question-id");
      if (globalId) {
        setActiveTabMap((prev) => {
          if (prev[`group-${groupIndex}`] === globalId) return prev;
          return { ...prev, [`group-${groupIndex}`]: globalId };
        });
      }
    }
  };

  const handleTabClick = (groupIndex: number, globalId: string) => {
    setActiveTabMap((prev) => ({ ...prev, [`group-${groupIndex}`]: globalId }));
    const container = scrollContainerRefs.current.get(groupIndex);
    if (!container) return;

    const panel = container.querySelector(`[data-question-id="${globalId}"]`);
    if (panel) {
      isScrollingToTab.current = true;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingToTab.current = false;
      }, 500);
    }
  };

  const scrollToQuestion = (globalId: string) => {
    if (!hasSharedMaterial) {
      const el = document.getElementById(`detail-q-${globalId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const groupIndex = findGroupIndexByGlobalId(globalId);
      if (groupIndex >= 0) {
        handleTabClick(groupIndex, globalId);
      }
    }
  };

  const renderAnswerCard = () => {
    const total = questionData?.questions?.length || 0;
    const answered = Object.keys(questionData?.userAnswers || {}).length;
    const qs = questionData?.questions || [];

    return (
      <div className="answer-card-bar">
        <div className="answer-card-info">
          <span className="answer-card-label">答题卡</span>
          <span className="answer-card-count">
            {answered}/{total}
          </span>
        </div>
        <div className="answer-card-grid">
          {qs.map((q, i) => {
            const ua = getUserAnswer(q.globalId);
            const hasAnswer = ua && ua.answer && ua.answer.choice;
            return (
              <div
                key={i}
                className={`answer-card-dot ${hasAnswer ? "answered" : "unanswered"}`}
                onClick={() => scrollToQuestion(q.globalId)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

  if (!hasSharedMaterial) {
    return (
      <div className="solution-page">
        <div className="solution-main">
          <div className="questions-single-list">
            {questions.map((group: any[], groupIndex: number) =>
              group.map((item: any, itemIndex: number) => {
                const questionIndex = questionData?.questions?.findIndex((q) => q.id === item.id) ?? itemIndex;
                return (
                  <div key={`${groupIndex}-${itemIndex}`} id={`detail-q-${item.globalId}`} className="questions-single-container">
                    <QuestionItem
                      onChange={onRadioChange}
                      data={item}
                      questionIndex={questionIndex}
                      materials={questionData?.materials || []}
                      materialIndex={item.materialIndexes?.[0] || 0}
                      userAnswer={getUserAnswer(item.globalId)}
                      disabled={false}
                      showSolution={false}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="solution-bottom-bar">
          <div className="solution-bottom-left">
            <Button variant="ghost" size="sm" onClick={onBack} className="solution-bottom-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 22" className="mr-1">
                <path d="M7.761 5.627a.7.7 0 0 1 .99.99l-3.534 3.534h13.68a.697.697 0 0 1 .7.7.7.7 0 0 1-.7.7H5.216l3.534 3.534a.7.7 0 1 1-.99.99l-4.558-4.558q-.18-.18-.223-.429-.02-.12-.006-.237-.015-.116.006-.237.043-.249.223-.429z" fillRule="evenodd" fill="currentColor" />
              </svg>
              返回
            </Button>
            <Button variant="ghost" size="sm" onClick={onJump} className="solution-bottom-btn">
              跳转粉笔
            </Button>
          </div>
          {renderAnswerCard()}
          <div className="solution-bottom-right">
            <Button variant="default" size="sm" onClick={onSubmit} className="solution-bottom-btn submit-btn">
              交卷
            </Button>
          </div>
        </div>

        <CanvasDrawing onClose={() => {}} />

        <AlertDialog
          open={showSubmitConfirm}
          onOpenChange={setShowSubmitConfirm}
          title="确认提交"
          description="确定要提交答案吗？提交后将无法修改。"
          cancelText="取消"
          confirmText="确定"
          onConfirm={handleConfirmSubmit}
        />
      </div>
    );
  }

  return (
    <div className="solution-page">
      <div className="solution-main">
        {questions.map((group: any[], groupIndex: number) => {
          const materialIndex = group[0]?.materialIndexes?.[0] ?? 0;
          const material = materialIndex > 0 ? questionData?.materials?.[materialIndex] : null;

          if (!material) {
            return (
              <div key={groupIndex} className="questions-single-list">
                {group.map((item: any, itemIndex: number) => {
                  const questionIndex = questionData?.questions?.findIndex((q) => q.id === item.id) ?? itemIndex;
                  return (
                    <div key={`${groupIndex}-${itemIndex}`} id={`detail-q-${item.globalId}`} className="questions-single-container">
                      <QuestionItem
                        onChange={onRadioChange}
                        data={item}
                        questionIndex={questionIndex}
                        materials={questionData?.materials || []}
                        materialIndex={0}
                        userAnswer={getUserAnswer(item.globalId)}
                        disabled={false}
                        showSolution={false}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          const activeKey = getActiveTab(`group-${groupIndex}`, group);

          return (
            <div key={groupIndex} className="resizable-container">
              <div className="resizable-left">
                <div className="materials-container">
                  <div className="material-body">
                    <span className="material-label-tab">材料</span>
                    <div
                      className="material-content"
                      dangerouslySetInnerHTML={{ __html: setImg(material.content) }}
                    />
                  </div>
                </div>
              </div>

              <div className="resizable-divider">
                <div className="resizable-divider-handle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="32" viewBox="0 0 4 32">
                    <circle cx="2" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
                    <circle cx="2" cy="16" r="1.5" fill="currentColor" opacity="0.3" />
                    <circle cx="2" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
              </div>

              <div className="resizable-right">
                <div className="questions-anchors">
                  {group.map((item: any, idx: number) => {
                    const questionIndex = questionData?.questions?.findIndex((q) => q.id === item.id) ?? idx;
                    return (
                      <button
                        key={item.globalId}
                        className={`questions-anchor-tab ${item.globalId === activeKey ? "active" : ""}`}
                        onClick={() => handleTabClick(groupIndex, item.globalId)}
                      >
                        {questionIndex + 1}题
                      </button>
                    );
                  })}
                </div>

                <div
                  className="questions-container"
                  ref={(el) => {
                    if (el) {
                      scrollContainerRefs.current.set(groupIndex, el);
                    } else {
                      scrollContainerRefs.current.delete(groupIndex);
                    }
                  }}
                  onScroll={() => handleScrollUpdate(groupIndex)}
                >
                  {group.map((item: any, itemIndex: number) => {
                    const questionIndex = questionData?.questions?.findIndex((q) => q.id === item.id) ?? itemIndex;
                    return (
                      <div
                        key={item.globalId}
                        data-question-id={item.globalId}
                        className="question-panel"
                      >
                        <QuestionItem
                          onChange={onRadioChange}
                          data={item}
                          questionIndex={questionIndex}
                          materials={questionData?.materials || []}
                          materialIndex={0}
                          userAnswer={getUserAnswer(item.globalId)}
                          disabled={false}
                          showSolution={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="solution-bottom-bar">
        <div className="solution-bottom-left">
          <Button variant="ghost" size="sm" onClick={onBack} className="solution-bottom-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 22" className="mr-1">
              <path d="M7.761 5.627a.7.7 0 0 1 .99.99l-3.534 3.534h13.68a.697.697 0 0 1 .7.7.7.7 0 0 1-.7.7H5.216l3.534 3.534a.7.7 0 1 1-.99.99l-4.558-4.558q-.18-.18-.223-.429-.02-.12-.006-.237-.015-.116.006-.237.043-.249.223-.429z" fillRule="evenodd" fill="currentColor" />
            </svg>
            返回
          </Button>
          <Button variant="ghost" size="sm" onClick={onJump} className="solution-bottom-btn">
            跳转粉笔
          </Button>
        </div>
        {renderAnswerCard()}
        <div className="solution-bottom-right">
          <Button variant="default" size="sm" onClick={onSubmit} className="solution-bottom-btn submit-btn">
            交卷
          </Button>
        </div>
      </div>

      <CanvasDrawing onClose={() => {}} />

      <AlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="确认提交"
        description="确定要提交答案吗？提交后将无法修改。"
        cancelText="取消"
        confirmText="确定"
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}

export default Detail;
