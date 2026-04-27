import * as React from "react";
import type { TSolutionData, TUserAnswerItem } from "../../types";
import { QuestionItem } from "../components/question-item";
import { getVscodeApi } from "../../view/utils/vscodeApi";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { setImg } from "@/view/utils/setImg";

const vscode = getVscodeApi();

function Answer() {
  const navigate = useNavigate();
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
    vscode.postMessage({ command: 'answerReady' });

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const onBack = () => {
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
    vscode.postMessage({ command: "download" });
  };

  // 根据materialKeys分组卡片
  const groupCardsByMaterial = () => {
    if (!solutionData?.card?.children?.[0]?.children) return [];
    
    const groups: { materialKey: string; cards: any[] }[] = [];
    const materialMap: { [key: string]: any[] } = {};
    
    solutionData.card.children[0].children.forEach((node: any) => {
      if (node.nodeType === 2) {
        const materialKey = node.materialKeys?.[0] || "";
        if (!materialMap[materialKey]) {
          materialMap[materialKey] = [];
        }
        materialMap[materialKey].push(node);
      }
    });
    
    Object.keys(materialMap).forEach(key => {
      groups.push({
        materialKey: key,
        cards: materialMap[key]
      });
    });
    
    return groups;
  };

  // 获取材料内容
  const getMaterialContent = (materialKey: string) => {
    return solutionData?.materials?.find((m: any) => m.globalId === materialKey);
  };

  // 获取题目内容
  const getSolutionByKey = (key: string) => {
    return solutionData?.solutions?.find((s: any) => s.globalId === key);
  };

  // 获取用户答案
  const getUserAnswerByKey = (key: string): TUserAnswerItem | undefined => {
    return (solutionData?.userAnswers || {})[key];
  };

  // 是否有共用材料（决定使用哪种布局）
  const hasSharedMaterial = () => {
    if (!solutionData?.card?.children?.[0]?.children) return false;
    return solutionData.card.children[0].children.some((node: any) => 
      node.nodeType === 2 && node.materialKeys?.length > 0
    );
  };

  const groups = groupCardsByMaterial();

  if (loading) {
    return (
      <div className="h-full bg-card p-4 flex items-center justify-center">
        <p className="text-foreground">加载中...</p>
      </div>
    );
  }

  // 格式二：简单列表（无共用材料）
  if (!hasSharedMaterial()) {
    return (
      <div className="h-full bg-card flex flex-col">
        <div className="top-bar flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-lg font-medium"></h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onDownload}>
              下载
            </Button>
          </div>
        </div>

        <div className="question-container flex-1 overflow-y-auto p-4">
          {groups.map((group, groupIndex) => {
            return group.cards.map((card, cardIndex) => {
              const solution = getSolutionByKey(card.key);
              if (!solution || !solution.solution) return null;
              
              const questionIndex = solutionData?.solutions?.findIndex((q: any) => q.id === solution.id) ?? cardIndex;
              
              return (
                <Card key={`${groupIndex}-${cardIndex}`} className="mb-6 rounded-lg shadow-sm">
                  <CardHeader className="flex justify-between items-start gap-4 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-primary font-medium">{questionIndex + 1}.</span>
                      <span className="text-sm text-muted-foreground">单选题</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuestionItem
                      onChange={() => { }}
                      data={solution}
                      questionIndex={questionIndex}
                      materials={solutionData?.materials || []}
                      materialIndex={0}
                      userAnswer={getUserAnswerByKey(card.key)}
                      disabled={true}
                    />
                  </CardContent>
                </Card>
              );
            });
          })}
        </div>

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
      </div>
    );
  }

  // 格式一：左右结构（有共用材料）- 以 material 为大卡片
  return (
    <div className="h-full bg-card flex flex-col">
      <div className="top-bar flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-lg font-medium"></h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDownload}>
            下载
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groups.map((group, groupIndex) => {
          const material = getMaterialContent(group.materialKey);
          if (!material) return null;
          
          return (
            <Card key={groupIndex} className="mb-6 rounded-lg shadow-sm overflow-hidden">
              <div className="flex h-[500px]">
                {/* 左侧材料区域 */}
                <div className="w-1/2 border-r border-border overflow-y-auto p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: setImg(material.content) }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
                
                {/* 右侧题目区域 - Tabs切换 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Tabs defaultValue={group.cards[0]?.key} className="flex-1 flex flex-col h-full">
                    <div className="border-b border-border px-4 flex-shrink-0">
                      <TabsList className="h-10 w-full grid grid-cols-5">
                        {group.cards.map((card, cardIndex) => {
                          const solution = getSolutionByKey(card.key);
                          if (!solution || !solution.solution) return null;
                          
                          const questionIndex = solutionData?.solutions?.findIndex((q: any) => q.id === solution.id) ?? cardIndex;
                          
                          return (
                            <TabsTrigger key={card.key} value={card.key} className="text-xs">
                              {questionIndex + 1}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {group.cards.map((card, cardIndex) => {
                        const solution = getSolutionByKey(card.key);
                        if (!solution || !solution.solution) return null;
                        
                        const questionIndex = solutionData?.solutions?.findIndex((q: any) => q.id === solution.id) ?? cardIndex;
                        
                        return (
                          <TabsContent key={card.key} value={card.key} className="p-4 h-full">
                            <QuestionItem
                              onChange={() => { }}
                              data={solution}
                              questionIndex={questionIndex}
                              materials={solutionData?.materials || []}
                              materialIndex={0}
                              userAnswer={getUserAnswerByKey(card.key)}
                              disabled={true}
                            />
                          </TabsContent>
                        );
                      })}
                    </div>
                  </Tabs>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
}

export default Answer