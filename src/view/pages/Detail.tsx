import * as React from "react";
import type { TSolutionData, TSetting } from "../types";
import { QuestionItem } from "../components/question-item";
import { ShenlunItem } from "../components/shenlun-item";
import { CanvasDrawing } from "../components/canvas-drawing";
import { useSetting } from "../components/hooks";
import { getVscodeApi } from "../utils/vscodeApi";
import { Button } from "../../components/ui/button";


export const Detail: React.FC = () => {
  const { setting } = useSetting();
  const [data, setData] = React.useState<TSolutionData | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const vscode = getVscodeApi();
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "showDetail") {
        setData(message.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleShowDraw = () => {
    setShow(true);
  };

  if (!data) {
    return (
      <div className="detail_page" style={{ color: setting?.color, fontSize: setting?.fontSize }}>
        <div className="top-bar">
          <h2>暂无数据</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="detail_page" style={{ color: setting?.color, fontSize: setting?.fontSize }}>
      <div className="top-bar">
        <h2>题目详情</h2>
        <Button onClick={handleShowDraw} className="draw_button">
          草稿
        </Button>
      </div>
      <div className="question-container">
        {data.questions.map((question) => (
          <div key={question.id} className="question-item">
            {question.type === 210 ? (
              //@ts-ignore
              <ShenlunItem question={question} solution={data.solutions.find((s) => s.id === question.id)} />
            ) : (
              //@ts-ignore
              <QuestionItem question={question} solution={data.solutions.find((s) => s.id === question.id)} />
            )}
          </div>
        ))}
      </div>
      {show && <CanvasDrawing onClose={() => setShow(false)} />}
    </div>
  );
};