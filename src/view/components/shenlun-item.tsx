import * as React from "react";
import type { TMaterials, TQuestionItem, TSolutionItem } from "../types";
import { radioMap } from "../utils/constant";
import { Textarea } from "../../components/ui/textarea";

interface TShenlunItemProps {
  data: TSolutionItem[];
  materials: TMaterials[];
  index: number;
  onChange: (e: string) => void;
}

export const ShenlunItem = (props: TShenlunItemProps) => {
  const { data = [], materials = [], onChange, index } = props;

  return (
    <div>
      {(materials || []).length > 0 && (
        <div
          dangerouslySetInnerHTML={{
            __html: materials?.[index].content,
          }}
        ></div>
      )}
      {(data || []).map((ele: TSolutionItem, index: number) => {
        return (
          <div className="question-item">
            <span>{index + 1}、</span>
            <span
              dangerouslySetInnerHTML={{
                __html: ele.content,
              }}
            ></span>

            <div className="answer-item">
              {(ele.accessories || []).map((access: any, ind: number) => {
                return (
                  <div className="mt-2">
                    <Textarea
                      defaultValue={ele?.userAnswer?.answer || ""}
                      maxLength={access?.wordCount || undefined}
                      placeholder="请输入答案..."
                      rows={6}
                      onBlur={(e) => {
                        onChange(e.target.value);
                      }}
                      className="w-full"
                    />
                    <div className="text-right text-sm text-gray-400 mt-1">
                      {ele?.userAnswer?.answer?.length || 0}/{access?.wordCount || 0}
                    </div>
                  </div>
                );
              })}
            </div>

            {ele?.solution && (
              <div className="solution-container">
                <p>
                  <span
                    className={
                      ele?.userAnswer?.choice === ele?.correctAnswer?.choice
                        ? "green"
                        : "red"
                    }
                    style={{
                      marginRight: "5px",
                    }}
                  >
                    你的答案：{radioMap[Number(ele?.userAnswer?.choice) + 1]}
                  </span>
                  <span className="green">
                    正确答案：{radioMap[Number(ele?.correctAnswer?.choice) + 1]}
                  </span>
                </p>
                <div style={{ fontWeight: "bold" }}>解析：</div>
                <div
                  className="solution"
                  dangerouslySetInnerHTML={{
                    __html: ele.solution,
                  }}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};