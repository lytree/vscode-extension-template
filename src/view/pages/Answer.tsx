import * as React from "react";
import { groupByMaterialIndexesTo2DArray } from "../utils/analyze";
import {
  TCacheData,
  TQuestionData,
  TQuestionItem,
  TSolutionData,
} from "../types";
import { QuestionItem } from "../components/question-item";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetting } from "../components/hooks";

import { getVscodeApi } from "../utils/vscodeApi";
import { ShenlunItem } from "../components/shenlun-item";

import "../style/detail.css";
import { Button } from "@/components/ui/button";

interface TLastAnswerRecord {
  lastCount: number | null;
  lastAnswer: number | null;
  lastQuestionId: number | null | undefined;
}

const vscode = getVscodeApi();
let modalIs = false;
export const Answer = () => {
  const [isFirst, setFirst] = React.useState(false);
  const [startTime, setStartTime] = React.useState(0);
  const [lastAnswerRecord, setLastAnswerRecord] =
    React.useState<TLastAnswerRecord>({
      lastCount: null,
      lastAnswer: null,
      lastQuestionId: null,
    });
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState<number>(1);
  const [questionData, setQuestionData] = React.useState<TQuestionData>();
  const [solutionData, setSolutionData] = React.useState<TSolutionData>();
  const [cacheData, setCacheData] = React.useState<TCacheData>();
  const { setting, setSetting } = useSetting();

  const navigate = useNavigate();
  const location = useLocation();
  const { id = "", type = 1 } = location.state || {};
  const defaultCombineKey = location.state?.combineKey || "";
  const [combineKey, setCombineKey] = React.useState(defaultCombineKey);

  React.useEffect(() => {
    getSolution({
      category: setting.categoryId,
      id,
      combineKey: combineKey,
      type,
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener("message", (event: any) => {
      const _message = event.data;
      setLoading(false);

      if (_message.command === "getQuestion") {
        setQuestionData(_message.data);
        setCombineKey(_message.data.combineKey);
      }
      if (_message.command === "message") {
        if (modalIs) return;
        alert(_message.data.message);
        modalIs = true;
        setTimeout(() => {
          modalIs = false;
        }, 1000);
      }
      if (_message.command === "solution") {
        setSolutionData(_message.data);
      }
    });
  }, []);

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
    navigate(-1);
  };

  const onShenlunChange = (text: string) => {
    vscode.postMessage({
      command: "answer",
      inc: true,
      postData: {
        startTime: startTime,
        combineKey: combineKey,
        category: setting.categoryId,
        answer: text,
      },
    });
  };

  const solutions = groupByMaterialIndexesTo2DArray(
    solutionData?.solutions || []
  );

  const onJump = () => {
    vscode.postMessage({
      command: "jumpFenbi",
      postData: {
        category: setting.categoryId,
        exerciseId: questionData?.exerciseId,
      },
    });
  };

  const list = solutions;

  return (
    <div className="detail_page">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-sm text-gray-400">loading...</div>
        </div>
      ) : (
        <div className="question-container">
          <div className="top-bar">
            <Button variant="ghost" onClick={onBack}>
              返回上一页
            </Button>

            <Button variant="default" onClick={onJump}>跳转粉笔网址</Button>
          </div>
          <div>
            答对题目数：{solutionData?.correctCount} / 
            {solutionData?.questionCount}{" "}
          </div>

          <div style={{ height: "10px" }}></div>

          <div>
            {(list || []).map((item: any, index: number) => {
              if (setting.categoryId == "shenlun") {
                return (
                  <ShenlunItem
                    key={`${page}-${index}`}
                    onChange={onShenlunChange}
                    data={item}
                    index={index}
                    materials={questionData?.materials || []}
                  />
                );
              }
              return (
                <QuestionItem
                  key={`${page}-${index}`}
                  onChange={() => {}}
                  data={item}
                  index={index}
                  materials={questionData?.materials || []}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};