import * as React from "react";
import type { TMaterials, TSolutionItem, TUserAnswerItem } from "../../types";
import { radioMap } from "../../view/utils/constant";
import { setImg } from "../../view/utils/setImg";
import { OptionGroup } from "@/components/ui/option-group";

interface TQuestionItemProps {
  data: TSolutionItem;
  materials?: TMaterials[];
  materialIndex?: number;
  userAnswer?: TUserAnswerItem;
  questionIndex: number;
  onChange: (e: any, item: TSolutionItem, index: number) => void;
  disabled?: boolean;
}

export const QuestionItem = (props: TQuestionItemProps) => {
  const { data: ele, materials = [], materialIndex = 0, userAnswer, questionIndex, onChange, disabled = false } = props;

  const [selectedAnswer, setSelectedAnswer] = React.useState<string | undefined>(() => {
    if (userAnswer && userAnswer.answer) {
      return userAnswer.answer.choice?.toString();
    }
    return undefined;
  });

  const getCurrentAnswer = () => {
    if (selectedAnswer !== undefined) {
      return selectedAnswer;
    }

    if (userAnswer && userAnswer.answer) {
      return userAnswer.answer.choice?.toString();
    }

    return ele?.userAnswer?.choice ? ele.userAnswer.choice.toString() : undefined;
  };

  const currentAnswer = getCurrentAnswer();

  const handleValueChange = (value: string) => {
    if (disabled) return;
    setSelectedAnswer(value);
    const event = { target: { value: Number(value) } } as any;
    onChange(event, ele, questionIndex);
  };

  return (
    <div>
      {materialIndex > 0 && (materials?.length > 0) && (
        <div
          dangerouslySetInnerHTML={{
            __html: setImg(materials?.[materialIndex]?.content),
          }}
        />
      )}
      <div className="question-item">
        <div
          dangerouslySetInnerHTML={{
            __html: setImg(ele.content),
          }}
        />

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
                  onValueChange={handleValueChange}
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
                {radioMap[Number(currentAnswer) + 1]}
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
            />
          </div>
        )}
      </div>
    </div>
  );
};
