import * as React from "react";
import type { TMaterials, TQuestionItem, TSolutionItem } from "../../types";
import { radioMap } from "../../view/utils/constant";
import { setImg } from "../../view/utils/setImg";
import { useSetting } from "../../view/components/hooks";
import { Button } from "@/components/ui/button";
import { OptionGroup } from "@/components/ui/option-group";

interface TQuestionItemProps {
  data: TSolutionItem[];
  materials: TMaterials[];
  index: number;
  isMultipleChoice?: boolean;
  onChange: (e: any, item: TSolutionItem, index: number) => void;
}
export const QuestionItem = (props: TQuestionItemProps) => {
  const { data = [], materials = [], onChange, index, isMultipleChoice = false } = props;

  const [excludeMap, setExcludeMap] = React.useState<Record<string, boolean>>(
    {},
  );

  const { setting } = useSetting();

  return (
    <div>
      {(data || []).map((ele: TSolutionItem, index: number) => {

        // 处理用户答案
        let userAnswer: string | string[] | undefined;
        if (isMultipleChoice) {
          // 多选：将用户答案转换为数组
          if (ele?.userAnswer?.choice) {
            userAnswer = Array.isArray(ele.userAnswer.choice)
              ? ele.userAnswer.choice.map(c => c.toString())
              : [ele.userAnswer.choice.toString()];
          }
        } else {
          // 单选：将用户答案转换为字符串
          userAnswer = ele?.userAnswer?.choice ? ele.userAnswer.choice.toString() : undefined;
        }

        return (
          <div>
            {(materials || []).length > 0 && (
              <div
                key={index}
                dangerouslySetInnerHTML={{
                  __html: setImg(materials?.[index]?.content),
                }}
              ></div>
            )}
            <div className="question-item">
              <span>
                {index + 1}、<span>单选题</span>
              </span>
              <div
                dangerouslySetInnerHTML={{
                  __html: setImg(ele.content),
                }}
              ></div>

              <div className="answer-item mt-4">
                {(ele.accessories || []).map((access: any, ind: number) => {
                  const options = (access?.options || []).map((option: any, index2: number) => ({
                    label: setImg(option),
                    value: index2.toString()
                  }));

                  return (
                    <div key={ind}>
                      <OptionGroup
                        type={isMultipleChoice ? "checkbox" : "radio"}
                        value={userAnswer}
                        onValueChange={(value) => {
                          if (isMultipleChoice) {
                            // 多选：将值转换为数组
                            const choices = Array.isArray(value)
                              ? value.map(v => Number(v))
                              : [Number(value)];
                            const event = { target: { value: choices } } as any;
                            onChange(event, ele, index);
                          } else {
                            // 单选：将值转换为数字
                            const event = { target: { value: Number(value) } } as any;
                            onChange(event, ele, index);
                          }
                        }}
                        options={options}
                        className="space-y-3"
                        optionClassName={"relative"}
                      />
                    </div>
                  );
                })}
              </div>

              {ele?.solution && (
                <div className="solution-container mt-4 p-3 bg-muted rounded-lg">
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
                      你的答案：
                      {isMultipleChoice
                        ? Array.isArray(ele?.userAnswer?.choice)
                          ? ele.userAnswer.choice.map(c => radioMap[Number(c) + 1]).join(', ')
                          : radioMap[Number(ele?.userAnswer?.choice) + 1]
                        : radioMap[Number(ele?.userAnswer?.choice) + 1]
                      }
                    </span>
                    <span className="green">
                      正确答案：
                      {isMultipleChoice
                        ? Array.isArray(ele?.correctAnswer?.choice)
                          ? ele.correctAnswer.choice.map(c => radioMap[Number(c) + 1]).join(', ')
                          : radioMap[Number(ele?.correctAnswer?.choice) + 1]
                        : radioMap[Number(ele?.correctAnswer?.choice) + 1]
                      }
                    </span>
                  </p>
                  <div className="green" style={{ fontWeight: "bold", marginTop: "8px" }}>
                    解析：
                  </div>
                  <div
                    className="solution mt-2"
                    dangerouslySetInnerHTML={{
                      __html: setImg(ele.solution),
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};