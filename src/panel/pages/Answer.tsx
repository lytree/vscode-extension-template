import * as React from "react";
import type { TSolutionData, TUserAnswerItem, TSolutionItem, TMaterials } from "../../types";
import { QuestionItem } from "../components/question-item";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { useLocation } from "react-router-dom";
import { setImg } from "@/view/utils/setImg";

const vscode = getVscodeApi();

type CardNode = {
  key: string;
  materialKeys?: string[];
  nodeType: number;
};

type CardGroup = {
  materialKey: string;
  cards: CardNode[];
};

function Answer() {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [solutionData, setSolutionData] = React.useState<TSolutionData | null>(null);
  const [activeTabMap, setActiveTabMap] = React.useState<Record<string, string>>({});
  const scrollContainerRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrollingToTab = React.useRef(false);

  React.useEffect(() => {
    if (location.state?.solutionData) {
      setSolutionData(location.state.solutionData);
      setLoading(false);
    }
  }, [location.state]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      setLoading(false);

      if (message.command === "getSolution") {
        setSolutionData(message.data);
      }

      if (message.command === "message") {
        alert(message.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "answerReady" });

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const onBack = () => vscode.postMessage({ command: "closePanel" });

  const onJump = () => {
    vscode.postMessage({
      command: "jumpFenbi",
      postData: {
        category: "xingce",
        exerciseId: solutionData?.exerciseId,
      },
    });
  };

  const onDownload = () => vscode.postMessage({ command: "download" });

  const cardNodes = React.useMemo<CardNode[]>(() => {
    const nodes = solutionData?.card?.children?.[0]?.children;
    if (!Array.isArray(nodes)) return [];
    return nodes.filter((node: CardNode) => node.nodeType === 2);
  }, [solutionData]);

  const groups = React.useMemo<CardGroup[]>(() => {
    const grouped = new Map<string, CardNode[]>();

    cardNodes.forEach((node) => {
      const materialKey = node.materialKeys?.[0] ?? "";
      const list = grouped.get(materialKey) ?? [];
      list.push(node);
      grouped.set(materialKey, list);
    });

    return [...grouped.entries()].map(([materialKey, cards]) => ({ materialKey, cards }));
  }, [cardNodes]);

  const hasSharedMaterial = React.useMemo(
    () => cardNodes.some((node) => (node.materialKeys?.length ?? 0) > 0),
    [cardNodes],
  );

  const materialMap = React.useMemo(() => {
    const map = new Map<string, { globalId: string; content: string }>();
    (solutionData?.materials || []).forEach((material: { globalId: string; content: string }) => {
      map.set(material.globalId, material);
    });
    return map;
  }, [solutionData]);

  const solutionMap = React.useMemo(() => {
    const map = new Map<string, TSolutionItem>();
    (solutionData?.solutions || []).forEach((solution) => {
      map.set(solution.globalId, solution);
    });
    return map;
  }, [solutionData]);

  const questionIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    (solutionData?.solutions || []).forEach((solution, index) => {
      map.set(solution.globalId, index);
    });
    return map;
  }, [solutionData]);

  const getUserAnswerByKey = (key: string): TUserAnswerItem | undefined => {
    return (solutionData?.userAnswers || {})[key];
  };

  const getRenderableCards = (cards: CardNode[]) =>
    cards
      .map((card) => {
        const solution = solutionMap.get(card.key);
        if (!solution?.solution) return null;

        const questionIndex = questionIndexMap.get(card.key) ?? 0;
        return { card, solution, questionIndex };
      })
      .filter((item): item is { card: CardNode; solution: TSolutionItem; questionIndex: number } => item !== null);

  const getActiveTab = (groupKey: string, cards: { card: CardNode }[]) => {
    if (activeTabMap[groupKey]) return activeTabMap[groupKey];
    return cards[0]?.card.key ?? "";
  };

  const isCorrect = (solution: TSolutionItem, userAnswer?: TUserAnswerItem) => {
    const userChoice = userAnswer?.answer?.choice ?? solution?.userAnswer?.choice;
    return userChoice === solution?.correctAnswer?.choice;
  };

  const findGroupIndexByCardKey = (cardKey: string): number => {
    return groups.findIndex((group) => group.cards.some((card) => card.key === cardKey));
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
      const cardKey = topPanel.getAttribute("data-question-id");
      if (cardKey) {
        setActiveTabMap((prev) => {
          if (prev[`group-${groupIndex}`] === cardKey) return prev;
          return { ...prev, [`group-${groupIndex}`]: cardKey };
        });
      }
    }
  };

  const handleTabClick = (groupIndex: number, cardKey: string) => {
    setActiveTabMap((prev) => ({ ...prev, [`group-${groupIndex}`]: cardKey }));
    const container = scrollContainerRefs.current.get(groupIndex);
    if (!container) return;

    const panel = container.querySelector(`[data-question-id="${cardKey}"]`);
    if (panel) {
      isScrollingToTab.current = true;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingToTab.current = false;
      }, 500);
    }
  };

  const scrollToQuestion = (cardKey: string) => {
    if (!hasSharedMaterial) {
      const el = document.getElementById(`answer-q-${cardKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const groupIndex = findGroupIndexByCardKey(cardKey);
      if (groupIndex >= 0) {
        handleTabClick(groupIndex, cardKey);
      }
    }
  };

  if (loading) {
    return <div className="h-full bg-card p-4 flex items-center justify-center">加载中...</div>;
  }

  const renderAnswerCard = () => {
    const total = solutionData?.questionCount || 0;
    const correct = solutionData?.correctCount || 0;
    const solutions = solutionData?.solutions || [];

    return (
      <div className="answer-card-bar">
        <div className="answer-card-info">
          <span className="answer-card-label">答题卡</span>
          <span className="answer-card-count">
            {correct}/{total}
          </span>
        </div>
        <div className="answer-card-grid">
          {solutions.map((solution, i) => {
            const userAnswer = getUserAnswerByKey(solution.globalId);
            const correctFlag = isCorrect(solution, userAnswer);
            return (
              <div
                key={i}
                className={`answer-card-dot ${correctFlag ? "correct" : "wrong"}`}
                onClick={() => scrollToQuestion(solution.globalId)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFooter = (
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
        <Button variant="ghost" size="sm" onClick={onDownload} className="solution-bottom-btn">
          下载
        </Button>
      </div>
    </div>
  );

  if (!hasSharedMaterial) {
    return (
      <div className="solution-page">
        <div className="solution-main">
          <div className="questions-single-list">
            {groups.flatMap((group, groupIndex) =>
              getRenderableCards(group.cards).map(({ card, solution, questionIndex }, cardIndex) => {
                const userAnswer = getUserAnswerByKey(card.key);
                const correctFlag = isCorrect(solution, userAnswer);
                return (
                  <div key={`${groupIndex}-${cardIndex}`} id={`answer-q-${card.key}`} className="questions-single-container">
                    <QuestionItem
                      onChange={() => {}}
                      data={solution}
                      questionIndex={questionIndex}
                      materials={solutionData?.materials || []}
                      materialIndex={0}
                      userAnswer={userAnswer}
                      disabled={true}
                      isCorrect={correctFlag}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>
        {renderFooter}
      </div>
    );
  }

  return (
    <div className="solution-page">
      <div className="solution-main">
        {groups.map((group, groupIndex) => {
          const material = materialMap.get(group.materialKey);
          const renderableCards = getRenderableCards(group.cards);

          if (!material || renderableCards.length === 0) {
            return null;
          }

          const activeKey = getActiveTab(`group-${groupIndex}`, renderableCards);

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
                  {renderableCards.map(({ card, questionIndex }) => (
                    <button
                      key={card.key}
                      className={`questions-anchor-tab ${card.key === activeKey ? "active" : ""}`}
                      onClick={() => handleTabClick(groupIndex, card.key)}
                    >
                      {questionIndex + 1}题
                    </button>
                  ))}
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
                  {renderableCards.map(({ card, solution, questionIndex }) => {
                    const userAnswer = getUserAnswerByKey(card.key);
                    const correctFlag = isCorrect(solution, userAnswer);
                    return (
                      <div
                        key={card.key}
                        data-question-id={card.key}
                        className="question-panel"
                      >
                        <QuestionItem
                          onChange={() => {}}
                          data={solution}
                          questionIndex={questionIndex}
                          materials={solutionData?.materials || []}
                          materialIndex={0}
                          userAnswer={userAnswer}
                          disabled={true}
                          isCorrect={correctFlag}
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
      {renderFooter}
    </div>
  );
}

export default Answer;
