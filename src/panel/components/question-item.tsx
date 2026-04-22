import * as React from "react";
import type { TMaterials, TQuestionItem, TSolutionItem, TUserAnswers, TSelectedAnswers } from "../../types";
import { radioMap } from "../../view/utils/constant";
import { setImg } from "../../view/utils/setImg";
import { OptionGroup } from "@/components/ui/option-group";

interface TQuestionItemProps {
  data: TSolutionItem[];
  materials: TMaterials[];
  userAnswers?: TUserAnswers;
  index: number;
  onChange: (e: any, item: TSolutionItem, index: number) => void;
}
export const QuestionItem = (props: TQuestionItemProps) => {
  const { data = [], materials = [], userAnswers, onChange, index } = props;

  //@ts-ignore
  const [selectedAnswers, setSelectedAnswers] = React.useState<TSelectedAnswers>({});

  return (
    <div>
      {(data || []).map((ele: TSolutionItem, index: number) => {

        // 从状态中获取选中的答案，如果没有则使用初始值
        const currentAnswer = (() => {
          // 优先使用用户传入的 userAnswers
          if (userAnswers && Object.keys(userAnswers).length > 0) {
            // 查找与当前题目匹配的答案
            const matchingAnswer = Object.values(userAnswers).find((answer: any) => 
              answer.id === ele.id
            );
            if (matchingAnswer && matchingAnswer.answer) {
              return matchingAnswer.answer.choice?.toString();
            }
          } 
          // 最后使用 ele.userAnswer
          return ele?.userAnswer?.choice ? ele.userAnswer.choice.toString() : undefined;
        })();

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
                        type="radio"
                        value={currentAnswer}
                        onValueChange={(value) => {
                          // 更新本地状态
                          setSelectedAnswers(prev => ({
                            ...prev,
                            [index]: value
                          }));

                          // 单选：将值转换为数字
                          const event = { target: { value: Number(value) } } as any;
                          onChange(event, ele, index);
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
                      {radioMap[Number(ele?.userAnswer?.choice) + 1]}
                    </span>
                    <span className="green">
                      正确答案：
                      {radioMap[Number(ele?.correctAnswer?.choice) + 1]}
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
