import * as React from "react";
import type { TSolutionData, TUserAnswerItem } from "../../types";
import { QuestionItem } from "../components/question-item";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
    const map = new Map<string, any>();
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
      .filter((item): item is { card: CardNode; solution: any; questionIndex: number } => item !== null);

  if (loading) {
    return <div className="h-full bg-card p-4 flex items-center justify-center">加载中...</div>;
  }

  const renderFooter = (
    <div className="bottom-bar border-t border-border p-4 bg-card">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button onClick={onBack}>返回上一页</Button>
          <Button onClick={onJump}>跳转粉笔网址</Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            答题卡
            <span className="text-muted-foreground ml-2">
              {solutionData?.correctCount || 0}/{solutionData?.questionCount || 0}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: solutionData?.questionCount || 0 }, (_, i) => (
              <Button key={i} size="sm" className="w-6 h-6 p-0 flex items-center justify-center">
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasSharedMaterial) {
    return (
      <div className="h-full bg-card flex flex-col">
        <div className="top-bar flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-lg font-medium"></h1>
          <Button variant="secondary" onClick={onDownload}>
            下载
          </Button>
        </div>

        <div className="question-container flex-1 overflow-y-auto p-4">
          {groups.flatMap((group, groupIndex) =>
            getRenderableCards(group.cards).map(({ card, solution, questionIndex }, cardIndex) => (
              <Card key={`${groupIndex}-${cardIndex}`} className="mb-6 rounded-lg shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary font-medium">{questionIndex + 1}.</span>
                    <span className="text-sm text-muted-foreground">单选题</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionItem
                    onChange={() => {}}
                    data={solution}
                    questionIndex={questionIndex}
                    materials={solutionData?.materials || []}
                    materialIndex={0}
                    userAnswer={getUserAnswerByKey(card.key)}
                    disabled={true}
                  />
                </CardContent>
              </Card>
            )),
          )}
        </div>

        {renderFooter}
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col">
      <div className="top-bar flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-lg font-medium"></h1>
        <Button variant="secondary" onClick={onDownload}>
          下载
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groups.map((group, groupIndex) => {
          const material = materialMap.get(group.materialKey);
          const renderableCards = getRenderableCards(group.cards);

          if (!material || renderableCards.length === 0) {
            return null;
          }

          return (
            <Card key={groupIndex} className="mb-6 rounded-lg shadow-sm overflow-hidden">
              <div className="flex h-[500px]">
                <div className="w-1/2 border-r border-border overflow-y-auto p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: setImg(material.content) }}
                    className="prose prose-sm max-w-none"
                  />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <Tabs defaultValue={renderableCards[0].card.key} className="flex-1 flex flex-col h-full">
                    <div className="border-b border-border px-4 flex-shrink-0">
                      <TabsList className="h-10 w-full grid grid-cols-5">
                        {renderableCards.map(({ card, questionIndex }) => (
                          <TabsTrigger key={card.key} value={card.key} className="text-xs">
                            {questionIndex + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {renderableCards.map(({ card, solution, questionIndex }) => (
                        <TabsContent key={card.key} value={card.key} className="p-4 h-full">
                          <QuestionItem
                            onChange={() => {}}
                            data={solution}
                            questionIndex={questionIndex}
                            materials={solutionData?.materials || []}
                            materialIndex={0}
                            userAnswer={getUserAnswerByKey(card.key)}
                            disabled={true}
                          />
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {renderFooter}
    </div>
  );
}

export default Answer;
